/**
 * Notifications API Service
 *
 * GET notification/api/ - List notifications for current user (paginated, newest first)
 * PATCH notification/api/{id}/read - Mark notification as read
 *
 * Response shape: { content: Notification[], totalElements, ... }
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

export interface NotificationActor {
  subId: string;
  username?: string;
  profilePicUrl?: string;
}

export interface Notification {
  id: number;
  type: "FOLLOW" | "LIKE" | "COMMENT" | "WORKOUT" | string;
  createdAt: string;
  read: boolean;
  actor: NotificationActor;
}

export interface NotificationsPage {
  content: Notification[];
  totalElements: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export const getNotifications = async (
  page: number = 0,
  size: number = 20
): Promise<NotificationsPage> => {
  try {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await apiRequest(`/notification/api/?${params}`, {
      method: "GET",
    });
    const data = await parseJsonResponse<any>(response);
    const content = data?.content ?? [];
    return {
      content: content as Notification[],
      totalElements: data?.totalElements ?? content.length,
      totalPages: data?.totalPages,
      size: data?.size,
      number: data?.number,
    };
  } catch {
    return { content: [], totalElements: 0 };
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  const recipientSubId = await getCurrentUserSub();
  if (!recipientSubId) throw new Error("Not authenticated");
  const response = await apiRequest(`/notification/api/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ recipientSubId }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Mark read failed: ${response.status}`);
  }
};
