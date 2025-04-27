import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useAuthStore from '~/store/authStore';

// Mock user data
const MOCK_USER = {
  id: 'TC-2458',
  name: 'James Wilson',
  email: 'jwilson@taxdept.gov',
  phone: '(555) 123-4567',
  department: 'Commercial Tax Collection',
  position: 'Senior Tax Collector',
  jurisdiction: 'Metro County',
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
  },
};

const Profile = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [editingUser, setEditingUser] = useState(false);
  const [tempUser, setTempUser] = useState(MOCK_USER);

  const { logout } = useAuthStore();
  
  const [addingPayer, setAddingPayer] = useState(false);
  const [newPayer, setNewPayer] = useState({
    name: '',
    type: 'Business', // 'Business' or 'Individual'
    identifier: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxCategory: '',
    notes: '',
  });
  
  // For demonstration purposes - in a real app this would come from an API
  const [recentPayers, setRecentPayers] = useState([
    {
      id: 'P-1001',
      name: 'City Supermarket Chain',
      type: 'Business',
      identifier: 'BUS-78954',
      registeredDate: '2025-03-15',
    },
    {
      id: 'P-1002',
      name: 'Downtown Office Complex',
      type: 'Business',
      identifier: 'BUS-32156',
      registeredDate: '2025-04-02',
    },
    {
      id: 'P-1003',
      name: 'Sarah Johnson',
      type: 'Individual',
      identifier: 'IND-65432',
      registeredDate: '2025-04-10',
    },
  ]);

  const handleSaveUserChanges = () => {
    // In a real app, this would call an API to update the user profile
    setUser(tempUser);
    setEditingUser(false);
    Alert.alert('Success', 'Your profile has been updated successfully.');
  };

  const handleAddPayer = () => {
    // Validate input fields
    if (!newPayer.name || !newPayer.identifier) {
      Alert.alert('Missing Information', 'Please provide at least the payer name and identifier.');
      return;
    }

    // In a real app, this would call an API to create the payer
    const payerId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdPayer = {
      id: payerId,
      ...newPayer,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    
    setRecentPayers([createdPayer, ...recentPayers]);
    setAddingPayer(false);
    setNewPayer({
      name: '',
      type: 'Business',
      identifier: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      taxCategory: '',
      notes: '',
    });
    
    Alert.alert('Success', `Payer "${newPayer.name}" has been registered successfully with ID: ${payerId}`);
  };

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>  
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        {renderSectionHeader('Your Profile')}
        <View style={styles.cardContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {user.name.split(' ').map(part => part[0]).join('')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileId}>ID: {user.id}</Text>
              <Text style={styles.profileDepartment}>{user.department}</Text>
              <Text style={styles.profilePosition}>{user.position}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempUser({...user});
                setEditingUser(true);
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{user.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jurisdiction</Text>
              <Text style={styles.detailValue}>{user.jurisdiction}</Text>
            </View>
          </View>
        </View>
        
        {/* Notification Preferences */}
        {/* {renderSectionHeader('Notification Preferences')}
        <View style={styles.cardContainer}>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Email Notifications</Text>
            <Switch
              trackColor={{ false: "#E1E8ED", true: "#4CAF50" }}
              thumbColor="#FFFFFF"
              value={user.notificationPreferences.email}
              onValueChange={(value) => setUser({
                ...user,
                notificationPreferences: {
                  ...user.notificationPreferences,
                  email: value
                }
              })}
            />
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Push Notifications</Text>
            <Switch
              trackColor={{ false: "#E1E8ED", true: "#4CAF50" }}
              thumbColor="#FFFFFF"
              value={user.notificationPreferences.push}
              onValueChange={(value) => setUser({
                ...user,
                notificationPreferences: {
                  ...user.notificationPreferences,
                  push: value
                }
              })}
            />
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>SMS Notifications</Text>
            <Switch
              trackColor={{ false: "#E1E8ED", true: "#4CAF50" }}
              thumbColor="#FFFFFF"
              value={user.notificationPreferences.sms}
              onValueChange={(value) => setUser({
                ...user,
                notificationPreferences: {
                  ...user.notificationPreferences,
                  sms: value
                }
              })}
            />
          </View>
        </View> */}
        
        {/* Manage Payers Section */}
        {renderSectionHeader('Payer Management')}
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.addPayerButton}
            onPress={() => setAddingPayer(true)}
          >
            <Text style={styles.addPayerButtonText}>+ Register New Payer</Text>
          </TouchableOpacity>
          
          <Text style={styles.recentPayersTitle}>Recently Registered Payers</Text>
          
          {recentPayers.map((payer) => (
            <View key={payer.id} style={styles.payerItem}>
              <View style={styles.payerHeader}>
                <Text style={styles.payerName}>{payer.name}</Text>
                <Text style={[
                  styles.payerType, 
                  payer.type === 'Business' ? styles.businessType : styles.individualType
                ]}>
                  {payer.type}
                </Text>
              </View>
              
              <View style={styles.payerDetails}>
                <Text style={styles.payerId}>ID: {payer.identifier}</Text>
                <Text style={styles.payerDate}>Registered: {payer.registeredDate}</Text>
              </View>
              
              <TouchableOpacity style={styles.viewPayerButton}>
                <Text style={styles.viewPayerText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {/* Other Settings */}
        {renderSectionHeader('App Settings')}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.settingOption}>
            <Text style={styles.settingOptionText}>Security Settings</Text>
            <Text style={styles.settingOptionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingOption}>
            <Text style={styles.settingOptionText}>Language Preferences</Text>
            <Text style={styles.settingOptionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingOption}>
            <Text style={styles.settingOptionText}>Help & Support</Text>
            <Text style={styles.settingOptionArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
        }}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Tax Collection App v1.0.3</Text>
        </View>
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editingUser}
        onRequestClose={() => setEditingUser(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditingUser(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.name}
                  onChangeText={(text) => setTempUser({...tempUser, name: text})}
                  placeholder="Enter your full name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.email}
                  onChangeText={(text) => setTempUser({...tempUser, email: text})}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.phone}
                  onChangeText={(text) => setTempUser({...tempUser, phone: text})}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.department}
                  onChangeText={(text) => setTempUser({...tempUser, department: text})}
                  placeholder="Enter your department"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Position</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.position}
                  onChangeText={(text) => setTempUser({...tempUser, position: text})}
                  placeholder="Enter your position"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jurisdiction</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.jurisdiction}
                  onChangeText={(text) => setTempUser({...tempUser, jurisdiction: text})}
                  placeholder="Enter your jurisdiction"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveUserChanges}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Add Payer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addingPayer}
        onRequestClose={() => setAddingPayer(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Payer</Text>
              <TouchableOpacity onPress={() => setAddingPayer(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.payerTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.payerTypeOption,
                    newPayer.type === 'Business' && styles.payerTypeSelected
                  ]}
                  onPress={() => setNewPayer({...newPayer, type: 'Business'})}
                >
                  <Text style={[
                    styles.payerTypeText,
                    newPayer.type === 'Business' && styles.payerTypeTextSelected
                  ]}>Business</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.payerTypeOption,
                    newPayer.type === 'Individual' && styles.payerTypeSelected
                  ]}
                  onPress={() => setNewPayer({...newPayer, type: 'Individual'})}
                >
                  <Text style={[
                    styles.payerTypeText,
                    newPayer.type === 'Individual' && styles.payerTypeTextSelected
                  ]}>Individual</Text>
                </TouchableOpacity>
              </View>
            
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {newPayer.type === 'Business' ? 'Business Name' : 'Full Name'} *
                </Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.name}
                  onChangeText={(text) => setNewPayer({...newPayer, name: text})}
                  placeholder={newPayer.type === 'Business' ? 'Enter business name' : 'Enter full name'}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {newPayer.type === 'Business' ? 'Business ID / Tax ID' : 'SSN / Tax ID'} *
                </Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.identifier}
                  onChangeText={(text) => setNewPayer({...newPayer, identifier: text})}
                  placeholder="Enter tax identifier"
                />
              </View>
              
              {newPayer.type === 'Business' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Person</Text>
                  <TextInput
                    style={styles.input}
                    value={newPayer.contactName}
                    onChangeText={(text) => setNewPayer({...newPayer, contactName: text})}
                    placeholder="Enter contact person's name"
                  />
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.email}
                  onChangeText={(text) => setNewPayer({...newPayer, email: text})}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.phone}
                  onChangeText={(text) => setNewPayer({...newPayer, phone: text})}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.address}
                  onChangeText={(text) => setNewPayer({...newPayer, address: text})}
                  placeholder="Enter complete address"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tax Category</Text>
                <TextInput
                  style={styles.input}
                  value={newPayer.taxCategory}
                  onChangeText={(text) => setNewPayer({...newPayer, taxCategory: text})}
                  placeholder="e.g., Property, Sales, Income"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newPayer.notes}
                  onChangeText={(text) => setNewPayer({...newPayer, notes: text})}
                  placeholder="Enter any additional information"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <Text style={styles.requiredFieldsNote}>* Required fields</Text>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddPayer}
              >
                <Text style={styles.saveButtonText}>Register Payer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'center',
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
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50', // Deep Blue
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2C3E50', // Deep Blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#36454F', // Charcoal
    marginBottom: 2,
  },
  profileId: {
    fontSize: 12,
    color: '#6B7C93',
    marginBottom: 6,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#36454F', // Charcoal
    marginBottom: 2,
  },
  profilePosition: {
    fontSize: 14,
    color: '#6B7C93',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#3498DB', // Accent Blue
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  profileDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#6B7C93',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#36454F', // Charcoal
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#36454F', // Charcoal
  },
  addPayerButton: {
    backgroundColor: '#4CAF50', // Secondary Mint Green
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addPayerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  recentPayersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#36454F', // Charcoal
    marginBottom: 12,
  },
  payerItem: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  payerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#36454F', // Charcoal
  },
  payerType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  businessType: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
  },
  individualType: {
    backgroundColor: '#F0F4C3',
    color: '#AFB42B',
  },
  payerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  payerId: {
    fontSize: 14,
    color: '#6B7C93',
  },
  payerDate: {
    fontSize: 14,
    color: '#6B7C93',
  },
  viewPayerButton: {
    borderWidth: 1,
    borderColor: '#3498DB', // Accent Blue
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  viewPayerText: {
    color: '#3498DB', // Accent Blue
    fontSize: 14,
    fontWeight: '500',
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingOptionText: {
    fontSize: 16,
    color: '#36454F', // Charcoal
  },
  settingOptionArrow: {
    fontSize: 20,
    color: '#6B7C93',
  },
  logoutButton: {
    backgroundColor: '#E74C3C', // Error Red
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    color: '#6B7C93',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50', // Deep Blue
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7C93',
    padding: 4,
  },
  modalScrollView: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#36454F', // Charcoal
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#DFE4EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#36454F', // Charcoal
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#3498DB', // Accent Blue
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  payerTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  payerTypeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#DFE4EA',
  },
  payerTypeSelected: {
    backgroundColor: '#3498DB', // Accent Blue
    borderColor: '#3498DB',
  },
  payerTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7C93',
  },
  payerTypeTextSelected: {
    color: '#FFFFFF',
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 8,
  },
});

export default Profile;