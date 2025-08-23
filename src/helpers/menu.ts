import { inject, InjectionKey, provide, Ref, ref } from "vue";

type Menu = {
  open: Ref<boolean>;
};

const MENU_INJECTION_KEY: InjectionKey<Menu> = Symbol("menu-injection-key");

function createMenu(): Menu {
  return {
    open: ref(false),
  };
}

export function provideMenu(): Menu {
  const menu = createMenu();

  provide(MENU_INJECTION_KEY, menu);

  return menu;
}

export function useMenu(): Menu {
  return inject(MENU_INJECTION_KEY, createMenu, true);
}
