'use client'

import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  MoonIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  SunIcon,
  UserIcon,
} from '@heroicons/react/20/solid'
import { useTheme } from 'next-themes'

import { Avatar } from '@/components/ui/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown'
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from '@/components/ui/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/ui/sidebar'
import { SidebarLayout } from '@/components/ui/sidebar-layout'

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useTheme()
  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current>
                <Square3Stack3DIcon />
                <SidebarLabel>管理</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <NavbarSpacer />
            <SidebarSection>
              <SidebarItem
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <MoonIcon className="dark:hidden" />
                <SunIcon className="hidden dark:block" />
                <SidebarLabel className="dark:hidden">深色</SidebarLabel>
                <SidebarLabel className="hidden dark:block">浅色</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}

export default AppLayout
