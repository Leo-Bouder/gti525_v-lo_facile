<template>
  <div class="graph-container">
    <h1>Passages Data Visualization</h1>

    <div class="status-section">
      <p v-if="loading" class="message">Loading CSV data...</p>
    </div>

    <div v-if="!loading" class="graph-controls">
      <div class="date-selector">
        <label for="startDate">From:</label>
        <input type="date" id="startDate" v-model="startDate" @change="updateChart()" />

        <label for="endDate">To:</label>
        <input type="date" id="endDate" v-model="endDate" @change="updateChart()" />
      </div>

      <div class="interval-selector">
        <label>
          <input type="radio" v-model="interval" value="jour" @change="updateChart()" /> Day
        </label>
        <label>
          <input type="radio" v-model="interval" value="semaine" @change="updateChart()" /> Week
        </label>
        <label>
          <input type="radio" v-model="interval" value="mois" @change="updateChart()" /> Month
        </label>
      </div>
    </div>

    <div class="graph-wrapper">
      <Bar :data="chartData" :options="chartOptions" v-if="chartData" />
      <p v-else-if="!loading" class="message">
        Aucune donnée disponible pour l'interval donné
      </p>
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

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
      filteredData: [],
      loading: false,
      startDate: null,
      endDate: null,
      interval: 'jour',
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
  methods: {
    setInitialDates() {
      this.endDate = "2022-01-31";
      this.startDate = "2022-01-01";
    },

    async updateChart() {
      const response = await axios.get(`http://localhost:8000/gti525/v1/compteurs/${this.selectedId}/passages?debut=${this.startDate}&fin=${this.endDate}&interval=${this.interval}`);
      this.filteredData = response.data;

      const sortedKeys = this.filteredData.map(d => d.periode);
      const dataValues = this.filteredData.map(d => d.total_passages);

      this.chartData = {
        labels: sortedKeys,
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
    this.setInitialDates();
    this.updateChart(true);
  }
};
</script>

<style scoped>
.graph-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 25px;
  background-color: var(--background-color);
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
  height: 50vh;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>