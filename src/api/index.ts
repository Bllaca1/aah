// Export all API functions
export * from './auth';
export * from './matches';
export * from './teams';
export * from './users';
export * from './friends';
export { default as apiClient, handleApiError } from './client';
export type { ApiError } from './client';
