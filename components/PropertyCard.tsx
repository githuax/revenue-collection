import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PropertyCard({
    property
}) {
    const isPaid = new Date(property.expiryDate) > new Date();
    const isToday = new Date(property.expiryDate).toDateString() === new Date().toDateString();

    return (
        <TouchableOpacity
            style={[styles.taskItem,
                isPaid && styles.taskComplete,
                isToday && styles.taskPending,
                !isPaid && !isToday && styles.taskError,
            ]}
            onPress={() => {/* Navigate to task detail */ }}
        >
            <View style={styles.taskHeader}>
                <View style={[styles.priorityIndicator, 
                    isPaid && styles.priorityPaid,
                    isToday && styles.priorityToday,
                    !isPaid && !isToday && styles.priorityOverDue,
                ]} />
                <Text style={styles.taskType}>{property.type}</Text>
                <TouchableOpacity
                    style={[styles.statusToggle]}
                    onPress={() => {}}
                >
                    <MaterialCommunityIcons name='delete' color={'#E74C3C'} size={20}/>
                </TouchableOpacity>
            </View>

            <Text style={[
                styles.taskTitle
            ]}>
                {property.title}
            </Text>

            <View style={styles.taskFooter}>
                <View style={styles.taskDateContainer}>
                    <Text style={[
                        styles.taskDate,
                        isPaid && styles.taskDateComplete,
                        isToday && styles.taskDateToday,
                        !isPaid && !isToday && styles.taskDateOverdue,
                    ]}>
                        Due: {new Date(property.expiryDate).toLocaleDateString()}
                        {isPaid && ' (Paid)'}
                        {isToday && ' (Today)'}
                        {!isPaid && !isToday && ' (Expired)'}
                    </Text>
                </View>
                {/* <Text style={styles.taskAmount}>${property.amount.toLocaleString()}</Text> */}
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
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
        borderLeftColor: '#3498DB',
    },
    taskPending: {
        borderLeftColor: '#F39C12',
    },
    taskError: {
        borderLeftColor: '#E74C3C',
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
    priorityOverDue: {
        backgroundColor: '#E74C3C', // Error Red
    },
    priorityToday: {
        backgroundColor: '#F39C12', // Warning Amber
    },
    priorityPaid: {
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
    taskDateComplete: {
        color: '#3498DB',
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
});