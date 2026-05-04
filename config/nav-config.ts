import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/admin/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Branch',
        url: '/admin/branch',
        icon: 'building',
        isActive: false,
        shortcut: ['p', 'p'],
        items: []
      }
    ]
  }
];
