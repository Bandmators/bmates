import { atom } from 'recoil';

export const wrappedGroupsState = atom<{ [key: string]: boolean }>({
  key: 'wrappedGroupsState',
  default: {},
});
