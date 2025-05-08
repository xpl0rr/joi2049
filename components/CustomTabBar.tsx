import React, { useRef, useEffect, useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Modal,
  useWindowDimensions,
  LayoutChangeEvent,
  FlatList
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';
import { useWidgets } from '@/contexts/WidgetContext';
import { hapticFeedback } from './HapticTab';

interface Tab {
  name: string;
  route: string;
  icon: IconSymbolName;
  title: string;
}

// Define core tabs that should always be visible
// Settings tab is placed as the 4th tab as requested
const coreTabs: Tab[] = [
  { name: 'index', route: '/', icon: 'house.fill', title: 'Dashboard' },
  { name: 'health', route: '/health', icon: 'heart.fill', title: 'Health' },
  { name: 'finance', route: '/finance', icon: 'dollarsign.circle.fill', title: 'Finance' },
  { name: 'widgets', route: '/widgets', icon: 'gearshape.fill', title: 'Settings' },
  { name: 'todo', route: '/todo', icon: 'checklist', title: 'Todo' }
];

export const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { pages } = useWidgets();
  const [customTabs, setCustomTabs] = useState<Tab[]>([]);
  const [showMoreIndicator, setShowMoreIndicator] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // Build custom tabs from pages that aren't the default ones
  useEffect(() => {
    const tabs = Object.values(pages)
      .filter(page => 
        page.customizable && 
        page.id !== 'dashboard' && 
        page.id !== 'health' && 
        page.id !== 'finance' && 
        page.id !== 'todo' && 
        page.id !== 'widgets'
      )
      .map(page => ({
        name: page.id,
        route: `/custom/${page.id}`,
        icon: 'square.grid.2x2.fill', // Default icon for custom tabs
        title: page.name
      }));
    
    setCustomTabs(tabs);
  }, [pages]);

  // Handle tab press with haptic feedback
  const handleTabPress = (route: string) => {
    hapticFeedback();
    router.replace(route);
    // Close menu if it's open
    if (menuVisible) {
      setMenuVisible(false);
    }
  };

  // Get active state for a tab
  const isActiveTab = (tabRoute: string) => {
    if (tabRoute === '/' && pathname === '/') return true;
    if (tabRoute !== '/' && pathname.startsWith(tabRoute)) return true;
    return false;
  };

  // Handle clicking the "more" indicator (show menu)
  const handleMorePress = () => {
    hapticFeedback();
    setMenuVisible(true);
  };

  // Get hidden tabs (Todo + custom tabs)
  const getHiddenTabs = () => {
    return [coreTabs[4], ...customTabs];
  };

  // Render individual tab item
  const renderTab = (tab: Tab, index: number) => {
    const isActive = isActiveTab(tab.route);
    
    return (
      <TouchableOpacity
        key={tab.name}
        style={[
          styles.tab, 
          isActive && styles.activeTab,
        ]}
        onPress={() => handleTabPress(tab.route)}
      >
        <IconSymbol 
          name={tab.icon} 
          size={36} 
          color={isActive ? '#4D82F3' : '#94A3B8'} 
        />
      </TouchableOpacity>
    );
  };

  // Render menu item for hidden tabs
  const renderMenuItem = (tab: Tab) => {
    const isActive = isActiveTab(tab.route);
    
    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.menuItem}
        onPress={() => handleTabPress(tab.route)}
      >
        <View style={styles.menuItemContent}>
          <IconSymbol 
            name={tab.icon} 
            size={40} 
            color={isActive ? '#4D82F3' : '#333333'} 
          />
          {/* Remove title from menu items for compactness */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Fixed core tabs (first 4 tabs) */}
        <View style={styles.fixedTabsContainer}>
          {coreTabs.slice(0, 4).map((tab, index) => renderTab(tab, index))}
        
          {/* More tabs indicator - tappable to show menu */}
          <TouchableOpacity 
            style={styles.moreIndicator}
            onPress={handleMorePress}
          >
            <IconSymbol name="ellipsis" size={36} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Hidden tabs menu */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Additional Tabs</Text>
                <TouchableOpacity 
                  onPress={() => setMenuVisible(false)}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <IconSymbol name="xmark" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
              {getHiddenTabs().map(tab => renderMenuItem(tab))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  container: {
    flexDirection: 'column',
    paddingTop: 3,
    paddingBottom: Platform.OS === 'ios' ? 10 : 2,
    height: Platform.OS === 'ios' ? 60 : 48,
  },
  fixedTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    width: '100%',
  },
  moreIndicator: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minWidth: 50,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4D82F3',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#4D82F3',
  },
  inactiveLabel: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 15,
    maxHeight: '70%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
}); 