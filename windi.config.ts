import { defineConfig } from 'windicss/helpers'
import typography from 'windicss/plugin/typography'

export default defineConfig({
  darkMode: 'class',
  // https://windicss.org/posts/v30.html#attributify-mode
  attributify: true,

  plugins: [
    typography(),
  ],
  theme: {
    fontFamily: {
      primary: [
        'PingFang SC',
        'Microsoft YaHei',
        'Helvetica Neue',
        '微软雅黑',
        'Helvetica',
        'Arial',
        'Roboto',
        'Segoe UI',
        'sans-serif',
      ],
    },
    extend: {
      colors: {
        gray: {
          1: '#272F3B',
          2: '#70767F',
          3: '#9DA1A7',
          4: '#C4C7CB',
          5: '#D9DCE0',
          6: '#EAEDF0',
          7: '#F0F2F6',
          8: '#F6F8FA',
        },
        primary: {
          DEFAULT: '#206EF7',
          bg: '#E4EDFE',
          hover: '#4A92FF',
          normal: '#206EF7',
          click: '#1151D1',
          light: '#E4EDFE',
        },
        error: {
          DEFAULT: '#F74439',
          bg: '#FEE3E2',
          hover: '#FF7063',
          click: '#D12826',
        },
        success: {
          DEFAULT: '#32BE48',
          bg: '#E0F5E4',
          hover: '#51DB78',
          click: '#1BA84C',
        },
        warning: {
          DEFAULT: '#F6A132',
          bg: '#FDEEDA',
          hover: '#FFC061',
          click: '#CF7F23',
        },
      },
      spacing: {
        22: '5.5rem',
        54: '13.5rem',
        82: '20.5rem',
        110: '27.5rem',
      },
    },
  },
})
