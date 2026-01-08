export const PATH = {
  HOME: '/home',
  GAME: '/game',
  SPLASH: '/splash',
} as const;

export type RouteKey = keyof typeof PATH;     
export type RoutePath = (typeof PATH)[RouteKey]; 
