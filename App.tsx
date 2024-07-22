import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native';


interface Character {
  id: number;
  name: string;
  status: string;
  location: {
    name: string;
  };
  gender: string;
  image: string;
  rating: number;
}


interface StatusCounts {
  alive: number;
  unknown: number;
  dead: number;
}

export default function App() {
  const [data, setData] = useState<Character[]>([]);
  const [filteredData, setFilteredData] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    alive: 0,
    unknown: 0,
    dead: 0,
  });

  useEffect(() => {
    fetch('https://rickandmortyapi.com/api/character')
      .then(response => response.json())
      .then((json: {results: Character[]}) => {
        // Mock rating data for demonstration purposes
        const updatedData = json.results.map(character => ({
          ...character,
          rating: Math.random() * 10, // Replace with actual rating
        }));
        setData(updatedData);

        // Count status occurrences
        const counts = updatedData.reduce(
          (acc: StatusCounts, character) => {
            acc[character.status.toLowerCase() as keyof StatusCounts] =
              (acc[character.status.toLowerCase() as keyof StatusCounts] || 0) +
              1;
            return acc;
          },
          {alive: 0, unknown: 0, dead: 0},
        );
        setStatusCounts(counts);

        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filterData = () => {
      const filtered = data.filter(character => {
        const statusMatch = statusFilter
          ? character.status.toLowerCase() === statusFilter.toLowerCase()
          : true;
        const locationMatch = locationFilter
          ? character.location.name
              .toLowerCase()
              .includes(locationFilter.toLowerCase())
          : true;
        const genderMatch = genderFilter
          ? character.gender.toLowerCase() === genderFilter.toLowerCase()
          : true;
        const ratingMatch = character.rating >= ratingFilter;
        return statusMatch && locationMatch && genderMatch && ratingMatch;
      });
      setFilteredData(filtered);
    };

    filterData();
  }, [statusFilter, locationFilter, genderFilter, ratingFilter, data]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'alive':
        return 'green';
      case 'unknown':
        return 'gray';
      case 'dead':
        return 'red';
      default:
        return 'transparent';
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  const totalCount = Object.values(statusCounts).reduce(
    (acc, count) => acc + count,
    0,
  );
  const getRatio = (status: string) =>
    totalCount > 0
      ? (statusCounts[status as keyof StatusCounts] / totalCount) * 100
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Filter by Status:</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusCircle,
              {backgroundColor: statusFilter === 'alive' ? 'green' : '#ddd'},
            ]}
            onPress={() => handleStatusFilter('alive')}
          />
          <Text style={styles.statusText}>
            Alive {getRatio('alive').toFixed(1)}%
          </Text>
          <TouchableOpacity
            style={[
              styles.statusCircle,
              {backgroundColor: statusFilter === 'unknown' ? 'gray' : '#ddd'},
            ]}
            onPress={() => handleStatusFilter('unknown')}
          />
          <Text style={styles.statusText}>
            Unknown {getRatio('unknown').toFixed(1)}%
          </Text>
          <TouchableOpacity
            style={[
              styles.statusCircle,
              {backgroundColor: statusFilter === 'dead' ? 'red' : '#ddd'},
            ]}
            onPress={() => handleStatusFilter('dead')}
          />
          <Text style={styles.statusText}>
            Dead {getRatio('dead').toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Filter by Location:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          value={locationFilter}
          onChangeText={setLocationFilter}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={({id}) => id.toString()}
          renderItem={({item}) => (
            <View style={styles.item}>
              <Image source={{uri: item.image}} style={styles.avatar} />
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusCircle,
                      {backgroundColor: getStatusColor(item.status)},
                    ]}
                  />
                  <Text>Status: {item.status}</Text>
                </View>
                <Text>Last Known Location: {item.location.name}</Text>
                <Text>Gender: {item.gender}</Text>
                <Text>Rating: {item.rating.toFixed(1)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
    backgroundColor: '#fff',
    padding: 8,
  },
  filterContainer: {
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerStyle: {
    backgroundColor: '#fafafa',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 20,
    borderRadius: 25,
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    marginBottom: 10,
  },
});
