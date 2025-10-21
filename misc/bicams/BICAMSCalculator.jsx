import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  BarElement
} from 'chart.js';
import { Calculator, Brain, FileText, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RAW_TO_SCALED = {
  cvlt: [
    { scaled: 1, min: 0, max: 19 },
    { scaled: 2, min: 20, max: 28 },
    { scaled: 3, min: 29, max: 31 },
    { scaled: 4, min: 32, max: 35 },
    { scaled: 5, min: 36, max: 39 },
    { scaled: 6, min: 40, max: 41 },
    { scaled: 7, min: 42, max: 44 },
    { scaled: 8, min: 45, max: 48 },
    { scaled: 9, min: 49, max: 52 },
    { scaled: 10, min: 53, max: 56 },
    { scaled: 11, min: 57, max: 60 },
    { scaled: 12, min: 61, max: 64 },
    { scaled: 13, min: 65, max: 66 },
    { scaled: 14, min: 67, max: 69 },
    { scaled: 15, min: 70, max: 71 },
    { scaled: 16, min: 72, max: 72 },
    { scaled: 17, min: 73, max: 74 },
    { scaled: 18, min: 75, max: 75 },
    { scaled: 19, min: 76, max: 80 }
  ],
  bvmtr: [
    { scaled: 3, min: 1, max: 2 },
    { scaled: 4, min: 3, max: 5 },
    { scaled: 5, min: 6, max: 8 },
    { scaled: 6, min: 9, max: 12 },
    { scaled: 7, min: 13, max: 17 },
    { scaled: 8, min: 18, max: 20 },
    { scaled: 9, min: 21, max: 23 },
    { scaled: 10, min: 24, max: 26 },
    { scaled: 11, min: 27, max: 28 },
    { scaled: 12, min: 29, max: 30 },
    { scaled: 13, min: 31, max: 32 },
    { scaled: 14, min: 33, max: 34 },
    { scaled: 15, min: 35, max: 35 },
    { scaled: 16, min: 36, max: 36 }
  ],
  sdmt: [
    { scaled: 3, min: 1, max: 9 },
    { scaled: 4, min: 10, max: 17 },
    { scaled: 5, min: 18, max: 23 },
    { scaled: 6, min: 24, max: 29 },
    { scaled: 7, min: 30, max: 36 },
    { scaled: 8, min: 37, max: 43 },
    { scaled: 9, min: 44, max: 49 },
    { scaled: 10, min: 50, max: 53 },
    { scaled: 11, min: 54, max: 58 },
    { scaled: 12, min: 59, max: 62 },
    { scaled: 13, min: 63, max: 68 },
    { scaled: 14, min: 69, max: 74 },
    { scaled: 15, min: 75, max: 79 },
    { scaled: 16, min: 80, max: 93 },
    { scaled: 17, min: 94, max: 107 },
    { scaled: 18, min: 108, max: 120 }
  ]
};

const REGRESSION_MODELS = {
  cvlt: {
    constant: 8.512324,
    age: -0.14798,
    age2: 0.001373,
    sex: 0.176426,
    education: 0.364315,
    residualSD: 2.527166
  },
  bvmtr: {
    constant: 11.58455,
    age: -0.14752,
    age2: 0.000896,
    sex: -0.19042,
    education: 0.22895,
    residualSD: 2.626665
  },
  sdmt: {
    constant: 9.248778,
    age: -0.01094,
    age2: -0.00086,
    sex: -0.4714,
    education: 0.263055,
    residualSD: 2.48323
  }
};

const INTERPRETATION_COLORS = {
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' }
};

const interpretZScore = (zScore) => {
  if (zScore <= -2) return { label: 'Extremamente Baixo', ...INTERPRETATION_COLORS.red };
  if (zScore <= -1.5) return { label: 'Limítrofe', ...INTERPRETATION_COLORS.orange };
  if (zScore <= -1) return { label: 'Média Inferior', ...INTERPRETATION_COLORS.yellow };
  if (zScore <= 1) return { label: 'Média', ...INTERPRETATION_COLORS.green };
  if (zScore <= 1.5) return { label: 'Média Superior', ...INTERPRETATION_COLORS.blue };
  if (zScore <= 2) return { label: 'Superior', ...INTERPRETATION_COLORS.indigo };
  return { label: 'Muito Superior', ...INTERPRETATION_COLORS.purple };
};

const interpretPercentile = (zScore) => {
  const percentiles = {
    '-3': 0.1,
    '-2.5': 0.6,
    '-2': 2.3,
    '-1.5': 6.7,
    '-1': 15.9,
    '-0.5': 30.9,
    '0': 50,
    '0.5': 69.1,
    '1': 84.1,
    '1.5': 93.3,
    '2': 97.7,
    '2.5': 99.4,
    '3': 99.9
  };
  const rounded = Math.round(zScore * 2) / 2;
  return percentiles[rounded.toString()] ?? 50;
};

const convertRawToScaled = (rawScore, test) => {
  const ranges = RAW_TO_SCALED[test];
  for (const range of ranges) {
    if (rawScore >= range.min && rawScore <= range.max) {
      return range.scaled;
    }
  }
  if (rawScore < ranges[0].min) {
    return ranges[0].scaled;
  }
  return ranges[ranges.length - 1].scaled;
};

const calculatePredictedScore = (model, age, gender, education) => {
  const genderValue = gender === 'male' ? 1 : 2;
  const age2 = age ** 2;
  return (
    model.constant +
    model.age * age +
    model.age2 * age2 +
    model.sex * genderValue +
    model.education * education
  );
};

const calculateZScore = (actualScaled, predictedScaled, residualSD) =>
  (actualScaled - predictedScaled) / residualSD;

const ResultsChart = ({ results }) => {
  const chartData = useMemo(() => {
    const labels = ['CVLT-II', 'BVMT-R', 'SDMT'];
    const labelToKey = {
      'CVLT-II': 'cvlt',
      'BVMT-R': 'bvmtr',
      SDMT: 'sdmt'
    };
    const scaledScores = labels.map((label) => results[labelToKey[label]]?.scaled ?? 0);
    const predictedScores = labels.map((label) =>
      Number(results[labelToKey[label]]?.predicted ?? 0)
    );

    return {
      labels,
      datasets: [
        {
          label: 'Escalonado Real',
          data: scaledScores,
          backgroundColor: 'rgba(99, 102, 241, 0.7)'
        },
        {
          label: 'Predito',
          data: predictedScores,
          backgroundColor: 'rgba(16, 185, 129, 0.7)'
        }
      ]
    };
  }, [results]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Comparação de Escores'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }),
    []
  );

  return (
    <div className="h-80">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

const BICAMSCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    education: '',
    cvltTotal: '',
    bvmtrTotal: '',
    sdmt: ''
  });
  const [results, setResults] = useState(null);

  const isFormValid = useMemo(
    () =>
      ['age', 'education', 'cvltTotal', 'bvmtrTotal', 'sdmt'].every(
        (field) => formData[field]
      ),
    [formData]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    const age = Number.parseInt(formData.age, 10);
    const education = Number.parseInt(formData.education, 10);
    const cvltRaw = Number.parseInt(formData.cvltTotal, 10);
    const bvmtrRaw = Number.parseInt(formData.bvmtrTotal, 10);
    const sdmtRaw = Number.parseInt(formData.sdmt, 10);

    const cvltScaled = convertRawToScaled(cvltRaw, 'cvlt');
    const bvmtrScaled = convertRawToScaled(bvmtrRaw, 'bvmtr');
    const sdmtScaled = convertRawToScaled(sdmtRaw, 'sdmt');

    const cvltPredicted = calculatePredictedScore(
      REGRESSION_MODELS.cvlt,
      age,
      formData.gender,
      education
    );
    const bvmtrPredicted = calculatePredictedScore(
      REGRESSION_MODELS.bvmtr,
      age,
      formData.gender,
      education
    );
    const sdmtPredicted = calculatePredictedScore(
      REGRESSION_MODELS.sdmt,
      age,
      formData.gender,
      education
    );

    const cvltZ = calculateZScore(
      cvltScaled,
      cvltPredicted,
      REGRESSION_MODELS.cvlt.residualSD
    );
    const bvmtrZ = calculateZScore(
      bvmtrScaled,
      bvmtrPredicted,
      REGRESSION_MODELS.bvmtr.residualSD
    );
    const sdmtZ = calculateZScore(
      sdmtScaled,
      sdmtPredicted,
      REGRESSION_MODELS.sdmt.residualSD
    );

    setResults({
      cvlt: {
        raw: cvltRaw,
        scaled: cvltScaled,
        predicted: cvltPredicted.toFixed(2),
        zScore: cvltZ.toFixed(2),
        percentile: interpretPercentile(cvltZ).toFixed(1),
        interpretation: interpretZScore(cvltZ)
      },
      bvmtr: {
        raw: bvmtrRaw,
        scaled: bvmtrScaled,
        predicted: bvmtrPredicted.toFixed(2),
        zScore: bvmtrZ.toFixed(2),
        percentile: interpretPercentile(bvmtrZ).toFixed(1),
        interpretation: interpretZScore(bvmtrZ)
      },
      sdmt: {
        raw: sdmtRaw,
        scaled: sdmtScaled,
        predicted: sdmtPredicted.toFixed(2),
        zScore: sdmtZ.toFixed(2),
        percentile: interpretPercentile(sdmtZ).toFixed(1),
        interpretation: interpretZScore(sdmtZ)
      }
    });
  };

  const testNames = {
    cvlt: 'CVLT-II (Memória Verbal)',
    bvmtr: 'BVMT-R (Memória Visual)',
    sdmt: 'SDMT (Velocidade de Processamento)'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-600 p-3 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Calculadora BICAMS</h1>
              <p className="text-gray-600">
                Brief International Cognitive Assessment for Multiple Sclerosis
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Normas brasileiras (Spedo et al., 2022)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Sobre o BICAMS:</p>
                <p>Protocolo breve para avaliação cognitiva em Esclerose Múltipla:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <strong>CVLT-II:</strong> Aprendizagem e memória verbal (soma dos 5 trials, máx: 80)
                  </li>
                  <li>
                    <strong>BVMT-R:</strong> Memória visual-espacial (soma dos 3 trials, máx: 36)
                  </li>
                  <li>
                    <strong>SDMT:</strong> Velocidade de processamento e atenção (forma oral, máx: 110)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Dados Demográficos</h3>
              <div className="space-y-4">
                <label className="block" htmlFor="age">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Idade (anos)
                  </span>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: 35"
                    min="18"
                    max="90"
                  />
                </label>

                <label className="block" htmlFor="gender">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </span>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </label>

                <label className="block" htmlFor="education">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Anos de Educação
                  </span>
                  <input
                    id="education"
                    type="number"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: 12"
                    min="1"
                    max="25"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ensino fundamental: 1-8 anos | Ensino médio: 9-11 anos | Superior: &gt;12 anos
                  </p>
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Escores dos Testes</h3>
              <div className="space-y-4">
                <label className="block" htmlFor="cvltTotal">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    CVLT-II Total (T1-T5)
                  </span>
                  <input
                    id="cvltTotal"
                    type="number"
                    name="cvltTotal"
                    value={formData.cvltTotal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0-80"
                    min="0"
                    max="80"
                  />
                  <p className="text-xs text-gray-500 mt-1">Soma dos 5 trials de aprendizagem</p>
                </label>

                <label className="block" htmlFor="bvmtrTotal">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    BVMT-R Total (T1-T3)
                  </span>
                  <input
                    id="bvmtrTotal"
                    type="number"
                    name="bvmtrTotal"
                    value={formData.bvmtrTotal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0-36"
                    min="0"
                    max="36"
                  />
                  <p className="text-xs text-gray-500 mt-1">Soma dos 3 trials de memória visual</p>
                </label>

                <label className="block" htmlFor="sdmt">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    SDMT Oral
                  </span>
                  <input
                    id="sdmt"
                    type="number"
                    name="sdmt"
                    value={formData.sdmt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0-110"
                    min="0"
                    max="110"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de substituições corretas em 90 segundos
                  </p>
                </label>
              </div>
            </section>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              isFormValid
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5" />
              Calcular Escores Corrigidos
            </span>
          </button>
        </div>

        {results ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <header className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">Resultados</h2>
            </header>

            <ResultsChart results={results} />

            <div className="space-y-6">
              {Object.entries(results).map(([test, data]) => (
                <article key={test} className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">{testNames[test]}</h3>
                  <div className="grid md:grid-cols-5 gap-4">
                    <MetricCard label="Escore Bruto" value={data.raw} accent="gray" />
                    <MetricCard label="Escore Escalonado" value={data.scaled} accent="blue" />
                    <MetricCard label="Escore Predito" value={data.predicted} accent="purple" />
                    <MetricCard label="Z-score" value={data.zScore} accent="indigo" />
                    <MetricCard label="Percentil" value={data.percentile} accent="green" />
                  </div>
                  <div
                    className={`${data.interpretation.bg} ${data.interpretation.border} border-l-4 p-4 rounded-lg`}
                  >
                    <p className="text-sm font-medium text-gray-700">Classificação:</p>
                    <p className={`text-lg font-bold ${data.interpretation.text}`}>
                      {data.interpretation.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <footer className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-sm text-gray-700 space-y-2">
              <p>
                <strong>Interpretação dos Z-scores:</strong>
              </p>
              <ul className="space-y-1">
                <li>
                  <strong>Z ≤ -2.0:</strong> Déficit significativo (Extremamente Baixo)
                </li>
                <li>
                  <strong>Z = -1.5 a -2.0:</strong> Limítrofe
                </li>
                <li>
                  <strong>Z = -1.0 a -1.5:</strong> Média Inferior
                </li>
                <li>
                  <strong>Z = -1.0 a +1.0:</strong> Média
                </li>
                <li>
                  <strong>Z &gt; +1.0:</strong> Acima da Média
                </li>
              </ul>
            </footer>

            <section className="text-xs text-gray-500 border-t pt-4 space-y-2">
              <p>
                <strong>Referência:</strong> Spedo CT, Pereira DA, Frndak SE, et al. Brief International Cognitive
                Assessment for Multiple Sclerosis (BICAMS): discrete and regression-based norms for the Brazilian
                context. Arq Neuropsiquiatr. 2022;80(1):62-68.
              </p>
              <p>
                <strong>Nota:</strong> Esta calculadora usa normas baseadas em regressão para correção por idade, gênero e
                escolaridade. Os resultados devem ser interpretados por profissional qualificado.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ACCENT_COLOR_CLASSES = {
  gray: { bg: 'bg-gray-50', text: 'text-gray-800' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' }
};

const MetricCard = ({ label, value, accent }) => {
  const classes = ACCENT_COLOR_CLASSES[accent] ?? ACCENT_COLOR_CLASSES.gray;
  return (
    <div className={`${classes.bg} p-4 rounded-lg`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${classes.text}`}>{value}</p>
    </div>
  );
};

export default BICAMSCalculator;
