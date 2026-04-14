<template>
  <svg
    v-if="iconPaths[name]"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon-svg"
  >
    <component :is="iconPaths[name]" />
  </svg>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
})

const iconPaths: Record<string, any> = {
  rocket: defineComponent({
    render: () => [
      h('path', {
        d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
      }),
      h('path', {
        d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
      }),
      h('path', { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' }),
      h('path', { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' }),
    ],
  }),
  dashboard: defineComponent({
    render: () => [
      h('rect', { width: '7', height: '9', x: '3', y: '3', rx: '1' }),
      h('rect', { width: '7', height: '5', x: '14', y: '3', rx: '1' }),
      h('rect', { width: '7', height: '9', x: '14', y: '12', rx: '1' }),
      h('rect', { width: '7', height: '5', x: '3', y: '16', rx: '1' }),
    ],
  }),
  globe: defineComponent({
    render: () => [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }),
      h('path', { d: 'M2 12h20' }),
    ],
  }),
  coins: defineComponent({
    render: () => [
      h('circle', { cx: '8', cy: '8', r: '6' }),
      h('path', { d: 'M18.09 10.37A6 6 0 1 1 10.34 18' }),
      h('path', { d: 'M7 6h1v4' }),
      h('path', { d: 'm16.71 13.88.7.71-2.82 2.82' }),
    ],
  }),
  flask: defineComponent({
    render: () => [
      h('path', { d: 'M10 2v7.31' }),
      h('path', { d: 'M14 9.3V1.99' }),
      h('path', { d: 'M8.5 2h7' }),
      h('path', { d: 'M14 9.3a6.5 6.5 0 1 1-4 0' }),
      h('path', { d: 'M5.52 16h12.96' }),
    ],
  }),
  star: defineComponent({
    render: () => [
      h('polygon', {
        points:
          '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      }),
    ],
  }),
  calendar: defineComponent({
    render: () => [
      h('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
      h('line', { x1: '16', x2: '16', y1: '2', y2: '6' }),
      h('line', { x1: '8', x2: '8', y1: '2', y2: '6' }),
      h('line', { x1: '3', x2: '21', y1: '10', y2: '10' }),
    ],
  }),
  check: defineComponent({
    render: () => [h('polyline', { points: '20 6 9 17 4 12' })],
  }),
  plus: defineComponent({
    render: () => [h('path', { d: 'M12 5v14M5 12h14' })],
  }),
  home: defineComponent({
    render: () => [
      h('path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' }),
    ],
  }),
}
</script>
