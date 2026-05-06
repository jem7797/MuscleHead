import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import { useUser } from "../Contexts/UserContext";
import SearchBar from "./SearchMainPage Components/SearchBar";
import UserSearchResults, { SearchUser } from "./SearchMainPage Components/UserSearchResults";
import RecentSearches from "./SearchMainPage Components/RecentSearches";
import RecommendedUsers from "./SearchMainPage Components/RecommendedUsers";
import { fetchRecommendedUsers, searchUsers, type RecommendedUserDto } from "../Services/userApi";
import { follow, unfollow, checkFollow, checkFollowRequestStatus } from "../Services/followApi";
import { getRecentSearches, addRecentSearch, clearRecentSearches } from "../Services/recentSearchesService";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const { userId: currentUserId, addToFollowingCount, feedInvalidationTrigger, privacySetting } = useUser();
  const [query, setQuery] = useState("");
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [requestPendingUserIds, setRequestPendingUserIds] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [followLoadingSubId, setFollowLoadingSubId] = useState<string | null>(null);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUserDto[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedFollowedIds, setRecommendedFollowedIds] = useState<Set<string>>(new Set());
  const [recommendedPendingIds, setRecommendedPendingIds] = useState<Set<string>>(new Set());

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
        const content = Array.isArray(res.content) ? res.content : [];
        if (append) {
          setUsers((prev) => [...prev, ...content]);
        } else {
          setUsers(content);
        }
        setPage(res.number);
        setTotalPages(res.totalPages);

        if (currentUserId && content.length > 0) {
          const followed = new Set<string>();
          const pending = new Set<string>();
          await Promise.all(
            content.map(async (u) => {
              const subId = u.sub_id ?? (u as { subId?: string }).subId;
              if (!subId || subId === currentUserId) return;
              const [isFollowing, reqStatus] = await Promise.all([
                checkFollow(currentUserId, subId),
                checkFollowRequestStatus(currentUserId, subId),
              ]);
              if (isFollowing) followed.add(subId);
              else if (reqStatus === "pending") pending.add(subId);
            })
          );
          setFollowedUserIds((prev) => {
            if (!append) return followed;
            const next = new Set(prev);
            followed.forEach((id) => next.add(id));
            return next;
          });
          setRequestPendingUserIds((prev) => {
            if (!append) return pending;
            const next = new Set(prev);
            pending.forEach((id) => next.add(id));
            return next;
          });
        } else if (!append) {
          setFollowedUserIds(new Set());
          setRequestPendingUserIds(new Set());
        }
      } catch (e) {
        if (!append) setUsers([]);
        const msg = e instanceof Error ? e.message : "Search failed";
        if (trimmedQuery.length >= 2) Alert.alert("Search error", msg);
      } finally {
        setIsLoading(false);
        setLoadMoreLoading(false);
      }
    },
    [trimmedQuery, canSearch, currentUserId]
  );

  const loadRecommended = useCallback(async () => {
    setRecommendedLoading(true);
    try {
      const list = await fetchRecommendedUsers();
      setRecommendedUsers(list);
      if (currentUserId && list.length > 0) {
        const followed = new Set<string>();
        const pending = new Set<string>();
        await Promise.all(
          list.map(async (dto) => {
            const subId = dto.id;
            if (!subId || subId === currentUserId) return;
            const [isFollowing, reqStatus] = await Promise.all([
              checkFollow(currentUserId, subId),
              checkFollowRequestStatus(currentUserId, subId),
            ]);
            if (isFollowing) followed.add(subId);
            else if (reqStatus === "pending") pending.add(subId);
          })
        );
        setRecommendedFollowedIds(followed);
        setRecommendedPendingIds(pending);
      } else {
        setRecommendedFollowedIds(new Set());
        setRecommendedPendingIds(new Set());
      }
    } catch {
      setRecommendedUsers([]);
      setRecommendedFollowedIds(new Set());
      setRecommendedPendingIds(new Set());
    } finally {
      setRecommendedLoading(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      getRecentSearches().then(setRecentSearches);
      loadRecommended();
    }, [loadRecommended])
  );

  useEffect(() => {
    if (feedInvalidationTrigger > 0) {
      getRecentSearches().then(setRecentSearches);
      if (canSearch) runSearch(0, false);
    }
  }, [feedInvalidationTrigger, canSearch, runSearch]);

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

  const handleUserPress = async (user: SearchUser) => {
    await addRecentSearch(user);
    setRecentSearches(await getRecentSearches());
    const subId = user.sub_id ?? (user as { subId?: string }).subId;
    if (subId) navigation.navigate("UserProfile", { subId });
  };

  const handleLoadMore = () => {
    if (page + 1 < totalPages && !loadMoreLoading) {
      runSearch(page + 1, true);
    }
  };

  const applyFollowSuccess = (
    subId: string,
    nowFollowing: boolean,
    reqStatus: string | undefined
  ) => {
    const clearPending = () => {
      setRequestPendingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });
      setRecommendedPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });
    };
    if (nowFollowing) {
      addToFollowingCount(1);
      setFollowedUserIds((prev) => new Set(prev).add(subId));
      setRecommendedFollowedIds((prev) => new Set(prev).add(subId));
      clearPending();
    } else if (reqStatus === "pending") {
      setRequestPendingUserIds((prev) => new Set(prev).add(subId));
      setRecommendedPendingIds((prev) => new Set(prev).add(subId));
    } else {
      addToFollowingCount(1);
      setFollowedUserIds((prev) => new Set(prev).add(subId));
      setRecommendedFollowedIds((prev) => new Set(prev).add(subId));
      clearPending();
    }
  };

  const handleFollowPress = async (user: { sub_id?: string; subId?: string }) => {
    const subId = user.sub_id ?? user.subId;
    if (!subId || !currentUserId) return;
    setFollowLoadingSubId(subId);
    try {
      await follow(subId);
      const [nowFollowing, reqStatus] = await Promise.all([
        checkFollow(currentUserId, subId),
        checkFollowRequestStatus(currentUserId, subId),
      ]);
      applyFollowSuccess(subId, nowFollowing, reqStatus);
    } catch (e) {
      Alert.alert("Follow failed", e instanceof Error ? e.message : "Could not follow. Please try again.");
    } finally {
      setFollowLoadingSubId(null);
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
      setRecommendedFollowedIds((prev) => {
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
        {showSearchResults ? (
          <UserSearchResults
            users={users}
            isLoading={isLoading}
            hasMore={page + 1 < totalPages}
            onLoadMore={handleLoadMore}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            requestPendingUserIds={requestPendingUserIds}
            followLoadingSubId={followLoadingSubId}
            onFollowPress={handleFollowPress}
            onUnfollowPress={handleUnfollowPress}
            onUserPress={handleUserPress}
          />
        ) : (
          <>
            <RecentSearches
              users={recentSearches}
              onUserPress={handleUserPress}
              onClearPress={async () => {
                await clearRecentSearches();
                setRecentSearches([]);
              }}
            />
            <RecommendedUsers
              users={recommendedUsers}
              isLoading={recommendedLoading}
              currentUserId={currentUserId}
              followedUserIds={recommendedFollowedIds}
              requestPendingUserIds={recommendedPendingIds}
              followLoadingSubId={followLoadingSubId}
              onUserPress={handleUserPress}
              onFollowPress={handleFollowPress}
              onUnfollowPress={handleUnfollowPress}
            />
          </>
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


