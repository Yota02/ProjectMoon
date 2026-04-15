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
  briefcase: defineComponent({
    render: () => [
      h('path', { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }),
      h('rect', { width: '20', height: '14', x: '2', y: '6', rx: '2' }),
    ],
  }),
  history: defineComponent({
    render: () => [
      h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
      h('path', { d: 'M3 3v5h5' }),
      h('path', { d: 'M12 7v5l4 2' }),
    ],
  }),
  graduation: defineComponent({
    render: () => [
      h('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
      h('path', { d: 'M6 12v5c0 2 2 3 6 3s6-1 6-3v-5' }),
    ],
  }),
  wrench: defineComponent({
    render: () => [
      h('path', {
        d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
      }),
    ],
  }),
  heart: defineComponent({
    render: () => [
      h('path', {
        d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
      }),
    ],
  }),
  shield: defineComponent({
    render: () => [
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' }),
    ],
  }),
  user: defineComponent({
    render: () => [
      h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' }),
    ],
  }),
  utensils: defineComponent({
    render: () => [
      h('path', { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }),
      h('path', { d: 'M7 2v20' }),
      h('path', { d: 'M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' }),
    ],
  }),
  droplet: defineComponent({
    render: () => [
      h('path', { d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' }),
    ],
  }),
  wind: defineComponent({
    render: () => [
      h('path', { d: 'M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2' }),
      h('path', { d: 'M9.6 4.6A2 2 0 1 1 11 8H2' }),
      h('path', { d: 'M12.6 19.4A2 2 0 1 0 14 16H2' }),
    ],
  }),
  box: defineComponent({
    render: () => [
      h('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
      h('path', { d: 'm3.3 7 8.7 5 8.7-5' }),
      h('path', { d: 'M12 22V12' }),
    ],
  }),
}
</script>
