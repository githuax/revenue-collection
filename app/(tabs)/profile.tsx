import { router } from 'expo-router';
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
import RegisterNewPropertyModal from '~/components/modals/RegisterNewPropertyModal';
import RegistrationSection from '~/components/settings/RegistrationSection';
import useAuthStore from '~/store/authStore';
import { supabase } from '~/utils/supabase';
import { UserData } from '~/types';

// Mock user data
const MOCK_USER = {
  id: 'TC-2458',
  name: 'James Wilson',
  email: 'jwilson@taxdept.gov',
  phone: '',
  department: 'Commercial Tax Collection',
  position: '',
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
  },
};

const Profile = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [editingUser, setEditingUser] = useState(false);
  const [tempUser, setTempUser] = useState<Partial<UserData>>({});

  const { user: storeUser, userData, logout } = useAuthStore();

  const handleSaveUserChanges = async () => {
    const updatedUser = {
      firstName: tempUser.first_name,
      lastName: tempUser.last_name,
      phone: tempUser.phone,
    }

    try {
      // Update user data in Supabase
      const { error } = await supabase
        .from('user')
        .update(updatedUser)
        .eq('id', storeUser?.id);

      if (error) throw error;

      // Update local state
      setEditingUser(false);
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const renderSectionHeader = (title: string) => (
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
                {userData?.first_name.charAt(0)}{userData?.last_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData?.first_name} {userData?.last_name}</Text>
              <Text style={styles.profileId}>ID: {userData?.id}</Text>
              <Text style={styles.profileDepartment}>{user.department}</Text>
              <Text style={styles.profilePosition}>{user.position}</Text>
            </View>
            {/* <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempUser({...user});
                setEditingUser(true);
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity> */}
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{storeUser?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{storeUser?.phone}</Text>
            </View>
          </View>
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
          logout().then(() => {
            
          });
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
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.first_name || userData?.first_name}
                  onChangeText={(text) => setTempUser({...tempUser, first_name: text})}
                  placeholder="Enter your first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.last_name || userData?.last_name}
                  onChangeText={(text) => setTempUser({...tempUser, last_name: text})}
                  placeholder="Enter your last name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={storeUser?.email}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser.phone || userData?.phone}
                  onChangeText={(text) => setTempUser({...tempUser, phone: text})}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
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