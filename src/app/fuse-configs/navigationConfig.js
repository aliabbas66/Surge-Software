import { authRoles } from 'app/auth';
import i18next from 'i18next';

import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [
  {
    id: 'applications',
    title: 'Applications',
    translate: 'APPLICATIONS',
    type: 'group',
    icon: 'apps',
    children: [
      {
        id: 'dashboards',
        title: 'Dashboards',
        translate: 'DASHBOARDS',
        type: 'collapse',
        icon: 'dashboard',
        children: [
          {
            id: 'analytics-dashboard',
            title: 'Website Analytics',
            type: 'item',
            url: 'apps/dashboards/analytics',
          },
          {
            id: 'marketing',
            title: 'Marketing',
            type: 'item',
            url: 'apps/dashboards/project',
          },
        ],
      },
      {
        id: 'calendar',
        title: 'Calendar',
        translate: 'CALENDAR',
        type: 'item',
        icon: 'today',
        url: 'apps/calendar',
      },
      {
        id: 'file-manager',
        title: 'File Manager',
        translate: 'FILE_MANAGER',
        type: 'item',
        icon: 'folder',
        url: 'apps/file-manager',
      },
      {
        id: 'chat',
        title: 'Chat',
        translate: 'CHAT',
        type: 'item',
        icon: 'chat',
        url: 'apps/chat',
        badge: {
          title: 13,
          bg: 'rgb(9, 210, 97)',
          fg: '#FFFFFF',
        },
      },
      {
        id: 'scrumboard',
        title: 'Scrumboard',
        translate: 'SCRUMBOARD',
        type: 'item',
        icon: 'assessment',
        url: 'apps/scrumboard',
      },
      {
        id: 'notes',
        title: 'Notes',
        translate: 'NOTES',
        type: 'item',
        icon: 'note',
        url: 'apps/notes',
      },
    ],
  },
  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'pages',
    children: [
      {
        id: 'authentication',
        title: 'Authentication',
        type: 'collapse',
        icon: 'lock',
        badge: {
          title: 10,
          bg: '#525E8A',
          fg: '#FFFFFF',
        },
        children: [
          {
            id: 'landing',
            title: 'Landing Page',
            type: 'item',
            url: 'pages/auth/login-2',
          },
          {
            id: 'login',
            title: 'Login',
            type: 'item',
            url: 'pages/auth/login-3',
          },
          {
            id: 'authentication-register-v3',
            title: 'Register',
            type: 'item',
            url: 'pages/auth/register-3',
          },
          {
            id: 'forgot-password',
            title: 'Forgot Password',
            type: 'item',
            url: 'pages/auth/forgot-password-2',
          },
     
          {
            id: 'reset-password',
            title: 'Reset Password',
            type: 'item',
            url: 'pages/auth/reset-password-2',
          },
        ],
      },
      {
        id: 'errors',
        title: 'Errors',
        type: 'collapse',
        icon: 'info',
        children: [
          {
            id: '404',
            title: '404',
            type: 'item',
            url: 'pages/errors/error-404',
          },
          {
            id: '500',
            title: '500',
            type: 'item',
            url: 'pages/errors/error-500',
          },
        ],
      },
      {
        id: 'maintenance',
        title: 'Maintenance',
        type: 'item',
        icon: 'build',
        url: 'pages/maintenance',
      },
      {
        id: 'pricing',
        title: 'Pricing',
        type: 'item',
        icon: 'attach_money',
        url: 'pages/pricing/style-2',
      },
    ],
  }
];

export default navigationConfig;
