import { atom, selector } from 'recoil';

export const wrappedGroupsState = atom<{ [key: string]: boolean }>({
  key: 'wrappedGroupsState',
  default: {},
});

export const openSidebarAtom = atom<boolean>({
  key: 'openSidebarAtom',
  default: false,
});

export const openSidebarState = selector({
  key: 'openSidebarState',
  get: ({ get }) => {
    return get(openSidebarAtom);
  },
  set: ({ set }, newVal) => {
    if (newVal) {
      document.body.classList.toggle('hidden', true);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // document.body.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.marginRight = `${scrollbarWidth}px`;
    } else {
      document.body.classList.toggle('hidden', false);
      document.body.style.marginRight = `${0}px`;
    }
    set(openSidebarAtom, newVal);
  },
});
