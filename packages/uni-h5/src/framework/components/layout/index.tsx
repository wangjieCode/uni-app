import {
  ref,
  withCtx,
  computed,
  ComputedRef,
  KeepAlive,
  openBlock,
  createBlock,
  createVNode,
  SetupContext,
  resolveDynamicComponent,
  defineComponent,
  reactive,
  onMounted,
  ComponentPublicInstance,
  Ref,
  watch,
  nextTick,
} from 'vue'

import { RouterView, useRoute } from 'vue-router'

import { defineSystemComponent } from '@dcloudio/uni-components'
import { updateCssVar } from '@dcloudio/uni-core'
import { useTabBar } from '../../setup/state'
import { useKeepAliveRoute } from '../../setup/page'
import { RESPONSIVE_MIN_WIDTH } from '@dcloudio/uni-shared'
import { checkMinWidth } from '../../../helpers/dom'
import { hasOwn } from '@vue/shared'

import TabBar from './tabBar'
import { usePageRoute } from '../../setup/provide'

type KeepAliveRoute = ReturnType<typeof useKeepAliveRoute>

const DEFAULT_CSS_VAR_VALUE = '0px'

let globalLayoutState: LayoutState
export function getLayoutState() {
  return globalLayoutState
}

export default /*#__PURE__*/ defineSystemComponent({
  name: 'Layout',
  setup(_props, { emit }) {
    const rootRef: Ref<HTMLElement | null> = ref(null)
    !__NODE_JS__ && initCssVar()
    const keepAliveRoute = (__UNI_FEATURE_PAGES__ &&
      useKeepAliveRoute()) as KeepAliveRoute
    const { layoutState, windowState } = __UNI_FEATURE_RESPONSIVE__
      ? useState()
      : ({} as ReturnType<typeof useState>)
    useMaxWidth(layoutState, rootRef)
    const topWindow = __UNI_FEATURE_TOPWINDOW__ && useTopWindow(layoutState)
    const leftWindow = __UNI_FEATURE_LEFTWINDOW__ && useLeftWindow(layoutState)
    const rightWindow =
      __UNI_FEATURE_RIGHTWINDOW__ && useRightWindow(layoutState)
    const showTabBar = (__UNI_FEATURE_TABBAR__ &&
      useShowTabBar(emit)) as ComputedRef<boolean>
    const clazz = useAppClass(showTabBar)
    globalLayoutState = layoutState
    return () => {
      const layoutTsx = createLayoutTsx(
        keepAliveRoute,
        layoutState,
        windowState,
        topWindow,
        leftWindow,
        rightWindow
      )
      const tabBarTsx = __UNI_FEATURE_TABBAR__ && createTabBarTsx(showTabBar)
      return (
        <uni-app ref={rootRef} class={clazz.value}>
          {layoutTsx}
          {tabBarTsx}
        </uni-app>
      )
    }
  },
})

function useAppClass(showTabBar?: ComputedRef<boolean>) {
  const showMaxWidth = ref(false)
  return computed(() => {
    return {
      'uni-app--showtabbar': showTabBar && showTabBar.value,
      'uni-app--maxwidth': showMaxWidth.value,
    }
  })
}

function initCssVar() {
  updateCssVar({
    '--status-bar-height': DEFAULT_CSS_VAR_VALUE,
    '--top-window-height': DEFAULT_CSS_VAR_VALUE,
    '--window-left': DEFAULT_CSS_VAR_VALUE,
    '--window-right': DEFAULT_CSS_VAR_VALUE,
    '--window-margin': DEFAULT_CSS_VAR_VALUE,
    '--tab-bar-height': DEFAULT_CSS_VAR_VALUE,
  })
}
interface LayoutState {
  topWindowMediaQuery: boolean
  showTopWindow: boolean
  apiShowTopWindow: boolean
  leftWindowMediaQuery: boolean
  showLeftWindow: boolean
  apiShowLeftWindow: boolean
  rightWindowMediaQuery: boolean
  showRightWindow: boolean
  apiShowRightWindow: boolean
  topWindowHeight: number
  marginWidth: number
  leftWindowWidth: number
  rightWindowWidth: number
  topWindowStyle: unknown
  leftWindowStyle: unknown
  rightWindowStyle: unknown
}
interface WindowState {
  matchTopWindow?: boolean
  showTopWindow?: boolean
  matchLeftWindow?: boolean
  showLeftWindow?: boolean
  matchRightWindow?: boolean
  showRightWindow?: boolean
}

function initMediaQuery(
  minWidth: number,
  callback: (ev: MediaQueryListEvent) => void
) {
  if (typeof window === 'object' && window.matchMedia) {
    const mediaQueryList = window.matchMedia('(min-width: ' + minWidth + 'px)')
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', callback)
    } else {
      mediaQueryList.addListener(callback)
    }
    return mediaQueryList.matches
  }
  return false
}

function useMaxWidth(
  layoutState: LayoutState,
  rootRef: Ref<HTMLElement | null>
) {
  const route = usePageRoute()
  function checkMaxWidth() {
    const windowWidth = document.body.clientWidth
    const maxWidth = parseInt(String(route.meta.maxWidth || 1190))
    let showMaxWidth = false
    if (windowWidth > maxWidth) {
      showMaxWidth = true
    } else {
      showMaxWidth = false
    }
    if (showMaxWidth && maxWidth) {
      layoutState.marginWidth = (windowWidth - maxWidth) / 2
      nextTick(() => {
        const rootEl = rootRef.value
        if (rootEl) {
          rootEl.setAttribute(
            'style',
            'max-width:' + maxWidth + 'px;margin:0 auto;'
          )
        }
      })
    } else {
      layoutState.marginWidth = 0
      nextTick(() => {
        const rootEl = rootRef.value
        if (rootEl) {
          rootEl.removeAttribute('style')
        }
      })
    }
  }
  watch([() => route.path], checkMaxWidth)
  onMounted(() => {
    checkMaxWidth()
    window.addEventListener('resize', checkMaxWidth)
  })
}

function useState() {
  const topWindowMediaQuery = ref(false)
  const leftWindowMediaQuery = ref(false)
  const rightWindowMediaQuery = ref(false)
  const showTopWindow = computed(
    () => __UNI_FEATURE_TOPWINDOW__ && topWindowMediaQuery.value
  )
  const showLeftWindow = computed(
    () => __UNI_FEATURE_LEFTWINDOW__ && leftWindowMediaQuery.value
  )
  const showRightWindow = computed(
    () => __UNI_FEATURE_RIGHTWINDOW__ && rightWindowMediaQuery.value
  )
  const layoutState: LayoutState = reactive({
    topWindowMediaQuery,
    showTopWindow,
    apiShowTopWindow: false,
    leftWindowMediaQuery,
    showLeftWindow,
    apiShowLeftWindow: false,
    rightWindowMediaQuery,
    showRightWindow,
    apiShowRightWindow: false,
    topWindowHeight: 0,
    marginWidth: 0,
    leftWindowWidth: 0,
    rightWindowWidth: 0,
    topWindowStyle: {},
    leftWindowStyle: {},
    rightWindowStyle: {},
  })
  const props: Array<'topWindow' | 'leftWindow' | 'rightWindow'> = [
    'topWindow',
    'leftWindow',
    'rightWindow',
  ]
  type StateProps =
    | 'topWindowMediaQuery'
    | 'leftWindowMediaQuery'
    | 'rightWindowMediaQuery'
  props.forEach((prop) => {
    const matchMedia = __uniConfig[prop]?.matchMedia
    let topWindowMinWidth = RESPONSIVE_MIN_WIDTH
    if (matchMedia && hasOwn(matchMedia, 'minWidth')) {
      const minWidth = matchMedia.minWidth!
      topWindowMinWidth = checkMinWidth(minWidth) ? minWidth : topWindowMinWidth
    }
    const matches = initMediaQuery(topWindowMinWidth, (ev) => {
      layoutState[`${prop}MediaQuery` as StateProps] = ev.matches
    })
    layoutState[`${prop}MediaQuery` as StateProps] = matches
  })
  watch(
    () => layoutState.topWindowHeight,
    (value) => updateCssVar({ '--top-window-height': value + 'px' })
  )
  watch(
    () => layoutState.marginWidth,
    (value) => updateCssVar({ '--window-margin': value + 'px' })
  )
  watch(
    () => layoutState.leftWindowWidth + layoutState.marginWidth,
    (value) => updateCssVar({ '--window-left': value + 'px' })
  )
  watch(
    () => layoutState.rightWindowWidth + layoutState.marginWidth,
    (value) => updateCssVar({ '--window-right': value + 'px' })
  )
  const windowState: WindowState = reactive({
    matchTopWindow: layoutState.topWindowMediaQuery,
    showTopWindow: layoutState.showTopWindow || layoutState.apiShowTopWindow,
    matchLeftWindow: layoutState.leftWindowMediaQuery,
    showLeftWindow: layoutState.showLeftWindow || layoutState.apiShowLeftWindow,
    matchRightWindow: layoutState.rightWindowMediaQuery,
    showRightWindow:
      layoutState.showRightWindow || layoutState.apiShowRightWindow,
  })
  return {
    layoutState,
    windowState,
  }
}

function createLayoutTsx(
  keepAliveRoute: KeepAliveRoute,
  layoutState: LayoutState,
  windowState: WindowState,
  topWindow?: unknown,
  leftWindow?: unknown,
  rightWindow?: unknown
) {
  const routerVNode = __UNI_FEATURE_PAGES__
    ? createRouterViewVNode(keepAliveRoute)
    : createPageVNode()
  // 非响应式
  if (!__UNI_FEATURE_RESPONSIVE__) {
    return routerVNode
  }
  const topWindowTsx = __UNI_FEATURE_TOPWINDOW__
    ? createTopWindowTsx(topWindow, layoutState, windowState)
    : null
  const leftWindowTsx = __UNI_FEATURE_LEFTWINDOW__
    ? createLeftWindowTsx(leftWindow, layoutState, windowState)
    : null
  const rightWindowTsx = __UNI_FEATURE_RIGHTWINDOW__
    ? createRightWindowTsx(rightWindow, layoutState, windowState)
    : null
  return (
    <uni-layout>
      {topWindowTsx}
      <uni-content>
        <uni-main>{routerVNode}</uni-main>
        {leftWindowTsx}
        {rightWindowTsx}
      </uni-content>
    </uni-layout>
  )
}

function useShowTabBar(emit: SetupContext<['change']>['emit']) {
  const route = useRoute()
  const tabBar = useTabBar()!
  // TODO meida query
  const showTabBar = computed(() => route.meta.isTabBar && tabBar.shown)
  !__NODE_JS__ &&
    updateCssVar({
      '--tab-bar-height': tabBar.height!,
    })
  return showTabBar
}

function createTabBarTsx(showTabBar: ComputedRef<boolean>) {
  return <TabBar v-show={showTabBar.value} />
}

function createPageVNode() {
  return createVNode(__uniRoutes[0].component)
}

function createRouterViewVNode({
  routeKey,
  isTabBar,
  routeCache,
}: ReturnType<typeof useKeepAliveRoute>) {
  return createVNode(RouterView, null, {
    default: withCtx(({ Component }: { Component: unknown }) => [
      (openBlock(),
      createBlock(
        KeepAlive,
        { matchBy: 'key', cache: routeCache },
        [
          (openBlock(),
          createBlock(resolveDynamicComponent(Component), {
            type: isTabBar.value ? 'tabBar' : '',
            key: routeKey.value,
          })),
        ],
        1032 /* PROPS, DYNAMIC_SLOTS */,
        ['cache']
      )),
    ]),
    _: 1 /* STABLE */,
  })
}

interface WindowComponentInfo {
  component: ReturnType<typeof defineComponent>
  windowRef: Ref<ComponentPublicInstance | null>
}

function useTopWindow(layoutState: LayoutState): WindowComponentInfo {
  const { component, style } = __uniConfig.topWindow!
  const windowRef: Ref<ComponentPublicInstance | null> = ref(null)
  function updateWindow() {
    const instalce = windowRef.value as ComponentPublicInstance
    const el: HTMLElement = instalce.$el
    const height = el.getBoundingClientRect().height
    layoutState.topWindowHeight = height
  }
  onMounted(updateWindow)
  watch(
    () => layoutState.showTopWindow || layoutState.apiShowTopWindow,
    () => nextTick(updateWindow)
  )
  layoutState.topWindowStyle = style
  return {
    component,
    windowRef,
  }
}
function useLeftWindow(layoutState: LayoutState): WindowComponentInfo {
  const { component, style } = __uniConfig.leftWindow!
  const windowRef: Ref<ComponentPublicInstance | null> = ref(null)
  function updateWindow() {
    const instalce = windowRef.value as ComponentPublicInstance
    const el: HTMLElement = instalce.$el
    const width = el.getBoundingClientRect().width
    layoutState.leftWindowWidth = width
  }
  onMounted(updateWindow)
  watch(
    () => layoutState.showLeftWindow || layoutState.apiShowLeftWindow,
    () => nextTick(updateWindow)
  )
  layoutState.leftWindowStyle = style
  return {
    component,
    windowRef,
  }
}
function useRightWindow(layoutState: LayoutState): WindowComponentInfo {
  const { component, style } = __uniConfig.rightWindow!
  const windowRef: Ref<ComponentPublicInstance | null> = ref(null)
  function updateWindow() {
    const instalce = windowRef.value as ComponentPublicInstance
    const el: HTMLElement = instalce.$el
    const width = el.getBoundingClientRect().width
    layoutState.rightWindowWidth = width
  }
  onMounted(updateWindow)
  watch(
    () => layoutState.showRightWindow || layoutState.apiShowRightWindow,
    () => nextTick(updateWindow)
  )
  layoutState.rightWindowStyle = style
  return {
    component,
    windowRef,
  }
}

function createTopWindowTsx(
  topWindow: unknown,
  layoutState: LayoutState,
  windowState: WindowState
) {
  if (topWindow) {
    const { component: TopWindow, windowRef } = topWindow as WindowComponentInfo
    return (
      <uni-top-window
        v-show={layoutState.showTopWindow || layoutState.apiShowTopWindow}
      >
        <div class="uni-top-window" style={layoutState.topWindowStyle as any}>
          <TopWindow ref={windowRef} {...windowState} />
        </div>
        <div
          class="uni-top-window--placeholder"
          style={{ height: layoutState.topWindowHeight + 'px' }}
        />
      </uni-top-window>
    )
  }
}
function createLeftWindowTsx(
  leftWindow: unknown,
  layoutState: LayoutState,
  windowState: WindowState
) {
  if (leftWindow) {
    const { component: LeftWindow, windowRef } =
      leftWindow as WindowComponentInfo
    return (
      <uni-left-window
        v-show={layoutState.showLeftWindow || layoutState.apiShowLeftWindow}
        data-show={layoutState.apiShowLeftWindow || undefined}
        style={layoutState.leftWindowStyle as any}
      >
        <div
          v-show={layoutState.apiShowLeftWindow}
          class="uni-mask"
          onClick={() => (layoutState.apiShowLeftWindow = false)}
        />
        <div class="uni-left-window">
          <LeftWindow ref={windowRef} {...windowState} />
        </div>
      </uni-left-window>
    )
  }
}
function createRightWindowTsx(
  rightWindow: unknown,
  layoutState: LayoutState,
  windowState: WindowState
) {
  if (rightWindow) {
    const { component: RightWindow, windowRef } =
      rightWindow as WindowComponentInfo
    return (
      <uni-right-window
        v-show={layoutState.showRightWindow || layoutState.apiShowRightWindow}
        data-show={layoutState.apiShowRightWindow || undefined}
        style={layoutState.rightWindowStyle as any}
      >
        <div
          v-show={layoutState.apiShowRightWindow}
          class="uni-mask"
          onClick={() => (layoutState.apiShowRightWindow = false)}
        />
        <div class="uni-right-window">
          <RightWindow ref={windowRef} {...windowState} />
        </div>
      </uni-right-window>
    )
  }
}
