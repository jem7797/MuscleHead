import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import { useUser } from "../Contexts/UserContext";
import SearchBar from "./SearchMainPage Components/SearchBar";
import UserSearchResults, { SearchUser } from "./SearchMainPage Components/UserSearchResults";
import { searchUsers } from "../Services/userApi";
import { follow, unfollow } from "../Services/followApi";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const { userId: currentUserId, addToFollowingCount } = useUser();
  const [query, setQuery] = useState("");
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;

  const runSearch = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (!canSearch) return;
      const isFirstPage = pageNum === 0;
      if (isFirstPage) setIsLoading(true);
      else setLoadMoreLoading(true);

      try {
        const res = await searchUsers(trimmedQuery, pageNum, PAGE_SIZE);
        if (append) {
          setUsers((prev) => [...prev, ...res.content]);
        } else {
          setUsers(res.content);
        }
        setPage(res.number);
        setTotalPages(res.totalPages);
      } catch (e) {
        if (!append) setUsers([]);
        const msg = e instanceof Error ? e.message : "Search failed";
        if (trimmedQuery.length >= 2) Alert.alert("Search error", msg);
      } finally {
        setIsLoading(false);
        setLoadMoreLoading(false);
      }
    },
    [trimmedQuery, canSearch]
  );

  useEffect(() => {
    if (!canSearch) {
      setUsers([]);
      setPage(0);
      setTotalPages(0);
      return;
    }
    const t = setTimeout(() => runSearch(0, false), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [trimmedQuery, canSearch, runSearch]);

  const handleLoadMore = () => {
    if (page + 1 < totalPages && !loadMoreLoading) {
      runSearch(page + 1, true);
    }
  };

  const handleFollowPress = async (user: { sub_id?: string; subId?: string }) => {
    const subId = user.sub_id ?? user.subId;
    if (!subId || !currentUserId) return;
    try {
      addToFollowingCount(1);
      await follow(subId);
      setFollowedUserIds((prev) => new Set(prev).add(subId));
    } catch {
      addToFollowingCount(-1);
    }
  };

  const handleUnfollowPress = async (user: { sub_id?: string; subId?: string }) => {
    const subId = user.sub_id ?? user.subId;
    if (!subId) return;
    try {
      addToFollowingCount(-1);
      await unfollow(subId);
      setFollowedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });
    } catch {
      addToFollowingCount(1);
    }
  };

  const showSearchResults = canSearch;
  const showMinCharsHint = trimmedQuery.length === 1;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmit={() => {
            if (canSearch) {
              Keyboard.dismiss();
              runSearch(0, false);
            }
          }}
        />
        {showMinCharsHint && (
          <Text style={styles.hint}>Type at least 2 characters to search</Text>
        )}
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {showSearchResults && (
          <UserSearchResults
            users={users}
            isLoading={isLoading}
            hasMore={page + 1 < totalPages}
            onLoadMore={handleLoadMore}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowPress={handleFollowPress}
            onUnfollowPress={handleUnfollowPress}
            onUserPress={(user) => {
              const subId = user.sub_id ?? (user as { subId?: string }).subId;
              if (subId) {
                navigation.navigate("UserProfile", { subId });
              }
            }}
          />
        )}
      </ScrollView>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBarContainer: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: "#9aa6bd",
  },
});

export default SearchScreen;


