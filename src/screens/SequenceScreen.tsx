import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StorageService } from '../services/StorageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Sequence'>;

const SequenceScreen: React.FC<Props> = ({ navigation }) => {
  const [sequenceNumber, setSequenceNumber] = useState('');
  const [autoIncrement, setAutoIncrement] = useState(true);

  useEffect(() => {
    loadLastSequence();
  }, []);

  const loadLastSequence = async () => {
    const last = await StorageService.getLastSequence();
    if (last) {
      if (autoIncrement) {
        const next = (parseInt(last, 10) + 1).toString();
        setSequenceNumber(isNaN(parseInt(last, 10)) ? last : next);
      } else {
        setSequenceNumber(last);
      }
    }
  };

  const handleStartCapture = () => {
    if (!sequenceNumber.trim()) {
      alert('Please enter a sequence number');
      return;
    }
    // Save preference
    StorageService.setLastSequence(sequenceNumber);

    navigation.navigate('Camera', { sequenceNumber });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>New Batch</Text>
          <Text style={styles.subtitle}>Enter the starting sequence number</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sequence Number</Text>
          <TextInput
            style={styles.input}
            value={sequenceNumber}
            onChangeText={setSequenceNumber}
            placeholder="e.g. 1001"
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.optionContainer}>
          <View>
            <Text style={styles.optionLabel}>Auto-increment</Text>
            <Text style={styles.optionSublabel}>Automatically increase number after each stamp</Text>
          </View>
          <Switch
            value={autoIncrement}
            onValueChange={setAutoIncrement}
            trackColor={{ false: '#767577', true: '#34C759' }}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleStartCapture}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    padding: 0,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  optionSublabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SequenceScreen;
