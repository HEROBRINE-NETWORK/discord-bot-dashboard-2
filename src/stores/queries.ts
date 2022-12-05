import { CustomGuildInfo } from './../config/custom-types';
import { useAPIStore } from './apiStore';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { UserInfo, getGuild, getGuilds, fetchUserInfo } from 'api/discord';
import { auth, fetchGuildInfo, logout } from 'api/bot';

export const client = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 0,
    },
  },
});

export const Keys = {
  login: ['login'],
  guild_info: (guild: string) => ['guild_info', guild],
};

export function useGuild(id: string) {
  const accessToken = useAPIStore((s) => s.accessToken);

  return useQuery(['guild', id], () => getGuild(accessToken, id), {
    enabled: accessToken != null,
  });
}

export function useGuilds() {
  const accessToken = useAPIStore((s) => s.accessToken);

  return useQuery(['user_guilds'], () => getGuilds(accessToken), {
    enabled: accessToken != null,
  });
}

export function useLogoutMutation() {
  return useMutation(['logout'], () => logout(), {
    onSuccess() {
      client.setQueryData<string>(Keys.login, () => null);
    },
  });
}

/**
 * Get discord oauth2 access token if logged in
 *
 * Then Store the token into api store
 */
export function useLoginQuery() {
  return useQuery(Keys.login, () => auth(), {
    onSuccess(token) {
      useAPIStore.setState({
        accessToken: token,
      });
    },
  });
}

export function useSelfUserQuery() {
  const accessToken = useAPIStore((s) => s.accessToken);

  return useQuery<UserInfo>(['users', 'me'], () => fetchUserInfo(accessToken), {
    enabled: accessToken != null,
    staleTime: Infinity,
  });
}

export function useGuildInfoQuery(guild: string) {
  return useQuery<CustomGuildInfo | null>(Keys.guild_info(guild), () => fetchGuildInfo(guild), {
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  });
}
