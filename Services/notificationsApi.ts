/**
 * Notifications API Service
 *
 * GET /notification/api/ - Paginated list of notifications (Spring Pageable)
 * PATCH /notification/api/{id}/read - Mark notification as read (204 No Content)
 * PATCH /notification/api/read-all - Mark all notifications for current user as read
 *
 * All endpoints use the authenticated user's sub_id from the JWT.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export interface Notification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  medalId?: number | null;
  medalName?: string | null;
  medalDescription?: string | null;
  /** User who performed the action (e.g. follower's sub_id for FOLLOW) */
  actorSubId?: string | null;
  actor_sub_id?: string | null;
  fromUserId?: string | null;
  from_user_id?: string | null;
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
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "createdAt,desc",
    });
    const response = await apiRequest(`/notification/api/?${params}`, {
      method: "GET",
    });
    const data = await parseJsonResponse<any>(response);
    const content = Array.isArray(data?.content) ? data.content : [];
    return {
      content: content as Notification[],
      totalElements: data?.totalElements ?? content.length,
      totalPages: data?.totalPages,
      size: data?.size ?? size,
      number: data?.number ?? page,
    };
  } catch {
    return { content: [], totalElements: 0 };
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  const response = await apiRequest(`/notification/api/${id}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Mark read failed: ${response.status}`);
  }
  // 204 No Content - no body to parse
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await apiRequest("/notification/api/read-all", {
    method: "PATCH",
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Mark all read failed: ${response.status}`);
  }
  // 204 No Content - no body to parse
};
