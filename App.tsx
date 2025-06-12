import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus, TimestampTrigger, TriggerType } from '@notifee/react-native';
AuthorizationStatus

type Task = {
  id: string;
  title: string;
  dueDate: Date;
};

export default function App() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminderMinutes, setReminderMinutes] = useState('10');

  // Création canal et demande permission notifications
  useEffect(() => {
    (async () => {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Notifications par défaut',
        });

        if (Platform.OS === 'ios') {
          const settings = await notifee.requestPermission();

          if (
            settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
            settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
          ) {
            console.log('Permission notifications accordée');
          } else {
            Alert.alert(
              'Notifications désactivées',
              'Merci d’activer les notifications pour recevoir les rappels.'
            );
          }
        }
      } catch (error) {
        console.error('Erreur permission/canal notification:', error);
      }
    })();
  }, []);

  // Chargement des tâches depuis le stockage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('tasks');
        if (saved) {
          const parsed: Task[] = JSON.parse(saved).map((t: any) => ({
            ...t,
            dueDate: new Date(t.dueDate),
          }));
          setTasks(parsed);
        }
      } catch (error) {
        console.error('Erreur chargement tâches :', error);
      }
    })();
  }, []);

  // Sauvegarde automatique des tâches
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Erreur sauvegarde tâches :', error);
      }
    })();
  }, [tasks]);

  const mergeDateTime = (date: Date, time: Date) => {
    const merged = new Date(date);
    merged.setHours(time.getHours());
    merged.setMinutes(time.getMinutes());
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    return merged;
  };

  const addTask = async () => {
    if (!title.trim()) return;

    const reminder = Number(reminderMinutes);
    if (isNaN(reminder)) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre valide pour le rappel.');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title,
      dueDate,
    };

    setTasks((prev) => [...prev, task]);
    setTitle('');

    const notificationTime = dueDate.getTime() - reminder * 60 * 1000;

    if (notificationTime > Date.now()) {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationTime,
      };

      try {
        await notifee.createTriggerNotification(
          {
            id: task.id, // important pour pouvoir l’annuler éventuellement!!!!!!
            title: 'Tâche à venir',
            body: `${title} dans ${reminder} min`,
            android: {
              channelId: 'default',
              pressAction: {
                id: 'default',
              },
            },
          },
          trigger
        );
        console.log('Notification programmée pour', new Date(notificationTime));
      } catch (error) {
        console.error('Erreur notification :', error);
      }
    } else {
      Alert.alert('Rappel trop proche', 'Le rappel est dans le passé.');
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await notifee.cancelNotification(id); // annule la notification programmée si existante
    } catch (error) {
      console.error('Erreur annulation notification :', error);
    }
  };

  const onDateSelected = (event: any, selectedDate?: Date) => {
    if ((event.type === 'set' || event.nativeEvent?.type === 'set') && selectedDate) {
      const newDate = new Date(selectedDate);
      const merged = mergeDateTime(newDate, dueDate);
      setDueDate(merged);
      setShowDate(false);
      setShowTime(true);
    } else {
      setShowDate(false);
    }
  };

  const onTimeSelected = (event: any, selectedTime?: Date) => {
    if ((event.type === 'set' || event.nativeEvent?.type === 'set') && selectedTime) {
      const merged = mergeDateTime(dueDate, selectedTime);
      setDueDate(merged);
    }
    setShowTime(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Mes Rappels</Text>

      <TextInput
        placeholder="Évènement"
        value={title}
        onChangeText={setTitle}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Button title="Choisir date et heure" onPress={() => setShowDate(true)} />

      <Text style={{ marginTop: 10 }}>
        Date du rappel : {dueDate.toLocaleString()}
      </Text>

      {showDate && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={onDateSelected}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={dueDate}
          mode="time"
          display="default"
          onChange={onTimeSelected}
        />
      )}

      <TextInput
        placeholder="Notification avant (min)"
        // value={reminderMinutes}
        onChangeText={setReminderMinutes}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginVertical: 10 }}
      />

      <Button title="Ajouter le rappel" onPress={addTask} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 10,
              borderBottomWidth: 1,
              marginTop: 10,
            }}
          >
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.dueDate.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: 'red' }}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
