import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import DashboardStats from '~/components/DashboardStats';
import Header from '~/components/Header';
import { getDashboardStats, getFeedPayments } from '~/services/dbService';
import useAuthStore from '~/store/authStore';

// Mock data for demonstration
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Follow up on Smith & Co. late filing',
    type: 'Follow-up',
    dueDate: '2025-04-23',
    amount: 12500,
    priority: 'high',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Review Johnson Property tax assessment',
    type: 'Review',
    dueDate: '2025-04-24',
    amount: 8750,
    priority: 'medium',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Process ABC Corp quarterly payment',
    type: 'Payment',
    dueDate: '2025-04-21',
    amount: 45000,
    priority: 'high',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Send reminder to XYZ LLC',
    type: 'Reminder',
    dueDate: '2025-04-25',
    amount: 5200,
    priority: 'medium',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Audit Global Enterprises filings',
    type: 'Audit',
    dueDate: '2025-04-30',
    amount: 67800,
    priority: 'low',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Update City Development tax records',
    type: 'Update',
    dueDate: '2025-04-22',
    amount: 23400,
    priority: 'high',
    status: 'complete',
  },
  {
    id: '7',
    title: 'Schedule meeting with delinquent taxpayers',
    type: 'Meeting',
    dueDate: '2025-04-29',
    amount: 34250,
    priority: 'medium',
    status: 'complete',
  },
];

const Home = () => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'complete'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    pendingCount: 0,
    completedCount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    getFeedPayments().then(data => {
      // console.log('Data', data)
    });

    getDashboardStats().then(data => {
      setStats({
        pendingCount: data.pendingPayments,
        completedCount: data.completedPayments,
        totalAmount: data.amountToCollect,
      });
    })
  }, [])

  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    
    // Apply priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    // Apply search query
    if (
      searchQuery && 
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    
    return true;
  });

  const markTaskComplete = (id) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, status: task.status === 'complete' ? 'pending' : 'complete' } : task
      )
    );
  };

  const renderTaskItem = ({ item }) => {
    const isPastDue = new Date(item.dueDate) < new Date();
    const isToday = new Date(item.dueDate).toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity 
        style={[
          styles.taskItem,
          item.status === 'complete' && styles.taskComplete,
        ]}
        onPress={() => {/* Navigate to task detail */}}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.priorityIndicator, styles[`priority${item.priority}`]]} />
          <Text style={styles.taskType}>{item.type}</Text>
          <TouchableOpacity 
            style={[styles.statusToggle, item.status === 'complete' && styles.statusToggleComplete]} 
            onPress={() => markTaskComplete(item.id)}
          >
            {item.status === 'complete' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>
        
        <Text style={[
          styles.taskTitle,
          item.status === 'complete' && styles.taskTitleComplete
        ]}>
          {item.title}
        </Text>
        
        <View style={styles.taskFooter}>
          <View style={styles.taskDateContainer}>
            <Text style={[
              styles.taskDate,
              isPastDue && styles.taskDateOverdue,
              isToday && styles.taskDateToday,
            ]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
              {isPastDue && ' (Overdue)'}
              {isToday && ' (Today)'}
            </Text>
          </View>
          <Text style={styles.taskAmount}>${item.amount.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title, count) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCount}>
        {/* <Text style={styles.sectionCountText}>{count}</Text> */}
        <TouchableOpacity>
          <Ionicons name="add" size={14} color="#6B7C93" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <Header 
        text={`Hello ${useAuthStore.getState().userData?.first_name} ${useAuthStore.getState().userData?.last_name}`}
        showBackButton={false}
      />

      {/* Task Statistics */}
      {/* <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${stats.totalAmount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>To Collect</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View> */}
      <DashboardStats />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'all' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('all')}
            >
              <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'pending' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'conflict' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('conflict')}
            >
              <Text style={[styles.filterText, filterStatus === 'conflict' && styles.filterTextActive]}>Conflict</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'refunded' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('refunded')}
            >
              <Text style={[styles.filterText, filterStatus === 'refunded' && styles.filterTextActive]}>Refunded</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'cancelled' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('cancelled')}
            >
              <Text style={[styles.filterText, filterStatus === 'cancelled' && styles.filterTextActive]}>Cancelled</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterStatus === 'complete' && styles.filterOptionActive]}
              onPress={() => setFilterStatus('complete')}
            >
              <Text style={[styles.filterText, filterStatus === 'complete' && styles.filterTextActive]}>Complete</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
        
        {/* <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Priority:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[styles.filterOption, filterPriority === 'all' && styles.filterOptionActive]}
              onPress={() => setFilterPriority('all')}
            >
              <Text style={[styles.filterText, filterPriority === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterPriority === 'high' && styles.filterOptionActive]}
              onPress={() => setFilterPriority('high')}
            >
              <Text style={[styles.filterText, filterPriority === 'high' && styles.filterTextActive]}>High</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterPriority === 'medium' && styles.filterOptionActive]}
              onPress={() => setFilterPriority('medium')}
            >
              <Text style={[styles.filterText, filterPriority === 'medium' && styles.filterTextActive]}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterOption, filterPriority === 'low' && styles.filterOptionActive]}
              onPress={() => setFilterPriority('low')}
            >
              <Text style={[styles.filterText, filterPriority === 'low' && styles.filterTextActive]}>Low</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </View>
      
      {/* Task List */}
      <View style={styles.listContainer}>
        {renderSectionHeader('My Payments', filteredTasks.length)}
        
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No tasks match your filters</Text>
              <TouchableOpacity 
                style={styles.resetFiltersButton}
                onPress={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light Gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50', // Deep Blue
  },
  addButton: {
    backgroundColor: '#3498DB', // Accent Blue
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE4EA',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7C93',
    marginBottom: 6,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE4EA',
    marginRight: 8,
    borderRadius: 16,
  },
  filterOptionActive: {
    backgroundColor: '#3498DB', // Accent Blue
    borderColor: '#3498DB',
  },
  filterText: {
    color: '#36454F', // Charcoal
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50', // Deep Blue
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E1E8ED',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#36454F', // Charcoal
  },
  sectionCount: {
    backgroundColor: '#E1E8ED',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  sectionCountText: {
    color: '#6B7C93',
    fontSize: 12,
    fontWeight: '500',
  },
  taskList: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DFE4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskComplete: {
    opacity: 0.7,
    borderLeftColor: '#4CAF50', // Secondary Mint Green
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  priorityhigh: {
    backgroundColor: '#E74C3C', // Error Red
  },
  prioritymedium: {
    backgroundColor: '#F39C12', // Warning Amber
  },
  prioritylow: {
    backgroundColor: '#3498DB', // Accent Blue
  },
  taskType: {
    fontSize: 12,
    color: '#6B7C93',
    backgroundColor: '#F5F7FA',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusToggle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DFE4EA',
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleComplete: {
    backgroundColor: '#4CAF50', // Secondary Mint Green
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#36454F', // Charcoal
    marginBottom: 12,
  },
  taskTitleComplete: {
    textDecorationLine: 'line-through',
    color: '#6B7C93',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#6B7C93',
  },
  taskDateOverdue: {
    color: '#E74C3C', // Error Red
    fontWeight: '500',
  },
  taskDateToday: {
    color: '#F39C12', // Warning Amber
    fontWeight: '500',
  },
  taskAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50', // Deep Blue
  },
  emptyListContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#6B7C93',
    fontSize: 16,
    marginBottom: 16,
  },
  resetFiltersButton: {
    backgroundColor: '#3498DB', // Accent Blue
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  resetFiltersText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default Home;