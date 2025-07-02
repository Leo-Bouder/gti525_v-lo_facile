<template>
  <div class="graph-container">
    <h1>Passages Data Visualization</h1>

    <div class="status-section">
      <p v-if="loading" class="message">Loading CSV data...</p>
      <p v-if="!loading && rawCsvData.length === 0" class="message">
        Pas de données valides
      </p>
    </div>

    <div v-if="rawCsvData.length > 0 && !loading" class="graph-controls">
      <div class="date-selector">
        <label for="startDate">From:</label>
        <input type="date" id="startDate" v-model="startDate" @change="updateChart" />

        <label for="endDate">To:</label>
        <input type="date" id="endDate" v-model="endDate" @change="updateChart" />
      </div>

      <div class="interval-selector">
        <label>
          <input type="radio" v-model="interval" value="day" @change="updateChart" /> Day
        </label>
        <label>
          <input type="radio" v-model="interval" value="week" @change="updateChart" /> Week
        </label>
        <label>
          <input type="radio" v-model="interval" value="month" @change="updateChart" /> Month
        </label>
      </div>
    </div>

    <div class="graph-wrapper">
      <Bar :data="chartData" :options="chartOptions" v-if="chartData" />
      <p v-else-if="rawCsvData.length > 0 && !loading" class="message">
        Aucune donnée disponible pour l'interval donné
      </p>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import moment from 'moment';

import csv2022Url from '../data/comptage_velo_2022.csv?url';
import csv2023Url from '../data/comptage_velo_2023.csv?url';
import csv2024Url from '../data/comptage_velo_2024.csv?url';
import csv2025Url from '../data/comptage_velo_2025.csv?url';
import { store } from '../components/store';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'Graph',
  components: {
    Bar,
  },
  props: {
    selectedId: {
        type: String,
        default: null
    }
  },
  data() {
    return {
      internalCsvUrls: [
        csv2022Url,
        csv2023Url,
        csv2024Url,
        csv2025Url,
      ],
      rawCsvData: [],
      loading: false,
      error: null,
      startDate: null,
      endDate: null,
      interval: 'day',
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Nombre de passages dans le temps',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date / Interval'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Nombre de passage'
            },
            beginAtZero: true
          }
        }
      },
    };
  },
  watch: {
    rawCsvData: {
      immediate: false,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.setInitialDates();
          this.updateChart();
        } else {
          this.chartData = null;
        }
      },
    },
  },
  methods: {
    async loadAllCsvData() {
      if(store.passageCsvs.length > 0) {
        this.rawCsvData = store.passageCsvs;
        return;
      }
      this.loading = true;
      this.rawCsvData = [];

      if (!this.internalCsvUrls || this.internalCsvUrls.length === 0) {
        this.loading = false;
        return;
      }

      try {
        const fetchPromises = this.internalCsvUrls.map(url => fetch(url).then(res => {
            return res.text();
        }));

        const csvTexts = await Promise.all(fetchPromises);
        let combinedData = [];
        let parsingErrors = [];

        csvTexts.forEach((csvText, index) => {
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            worker: true,
            complete: (results) => {
              if (results.errors.length) {
                results.errors.forEach(err => parsingErrors.push(`CSV ${this.internalCsvUrls[index]}: ${err.message}`));
              }
              const parsedBatch = results.data.filter(row =>
                row.date_heure &&
                row.nb_passages !== undefined && row.nb_passages !== null &&
                !isNaN(parseInt(row.nb_passages, 10))
              ).map(row => ({
                  date_heure: moment(String(row.date_heure)).valueOf(),
                  id_compteur: String(row.id_compteur),
                  nb_passages: parseInt(row.nb_passages, 10)
              }));
              combinedData = combinedData.concat(parsedBatch);
            },
            error: (err) => {
              console.log(`PapaParse error for CSV ${this.internalCsvUrls[index]}: ${err.message}`);
            }
          });
        });

        this.rawCsvData = combinedData;
        store.passageCsvs = combinedData;
      } catch (err) {
        this.error = 'Failed to load CSV files: ' + err.message;
        this.rawCsvData = [];
      } finally {
        this.loading = false;
      }
    },

    setInitialDates() {
      this.endDate = "2022-01-01";
      this.startDate = "2022-01-31";
    },

    updateChart() {
      if (!this.rawCsvData || this.rawCsvData.length === 0 || !this.startDate || !this.endDate) {
        this.chartData = null;
        return;
      }

      const startMoment = moment(this.startDate).startOf('day').valueOf();
      const endMoment = moment(this.endDate).endOf('day').valueOf();

      const filteredData = this.rawCsvData.filter(item => {
        const itemDate = moment(item.date_heure);
        const dateFilter = itemDate >= startMoment && itemDate <= startMoment;

        const matchesId = String(item.id_compteur) === this.selectedId;

        return dateFilter && matchesId;
      });

      if (filteredData.length === 0) {
        this.chartData = null;
        return;
      }

      const aggregatedData = {};

      filteredData.forEach(item => {
        const itemDate = moment(item.date_heure);
        let key;

        if (this.interval === 'day') {
          key = itemDate.format('YYYY-MM-DD');
        } else if (this.interval === 'week') {
          key = itemDate.startOf('isoWeek').format('YYYY-MM-DD [Week] WW');
        } else if (this.interval === 'month') {
          key = itemDate.format('YYYY-MM');
        }

        const passages = item.nb_passages;

        if (aggregatedData[key]) {
          aggregatedData[key] += passages;
        } else {
          aggregatedData[key] = passages;
        }
      });

      const sortedKeys = Object.keys(aggregatedData).sort((a, b) => {
        if (this.interval === 'day' || this.interval === 'month') {
          return moment(a).valueOf() - moment(b).valueOf();
        } else if (this.interval === 'week') {
          return moment(a.split(' ')[0]).valueOf() - moment(b.split(' ')[0]).valueOf();
        }
        return 0;
      });

      const labels = sortedKeys;
      const dataValues = sortedKeys.map(key => aggregatedData[key]);

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Passages total',
            backgroundColor: '#42b983',
            borderColor: '#36a2eb',
            borderWidth: 1,
            data: dataValues,
          },
        ],
      };
    },
  },
  mounted() {
    // Call loadAllCsvData when the component is mounted
    this.loadAllCsvData();
    this.setInitialDates();
    this.updateChart();
  }
};
</script>

<style scoped>
.graph-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 900px;
  margin: 30px auto;
  padding: 25px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.status-section {
  margin-bottom: 20px;
  min-height: 20px;
}

.message {
  color: #666;
  font-style: italic;
}

.error-message {
  color: #e74c3c;
  font-weight: bold;
  white-space: pre-wrap;
}

.graph-controls {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.date-selector,
.interval-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-selector label,
.interval-selector label {
  font-weight: bold;
  color: #333;
}

input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.3s ease;
}

input[type="date"]:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.interval-selector input[type="radio"] {
  margin-right: 5px;
  accent-color: #42b983;
}

.graph-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>