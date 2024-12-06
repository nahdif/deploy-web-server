const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat()

    // Mengklasifikasikan hasil dengan model
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    // Tentukan label berdasarkan skor tertinggi
    const classes = ['Melanocytic nevus', 'Squamous cell carcinoma', 'Vascular lesion'];
    const classResult = tf.argMax(prediction, 1).dataSync()[0];
    const label = classes[classResult];

    let suggestion;

    // Menentukan suggestion berdasarkan label
    if (label === 'Melanocytic nevus') {
      suggestion = "Segera konsultasi dengan dokter terdekat jika ukuran semakin membesar dengan cepat, mudah luka atau berdarah.";
    } else if (label === 'Squamous cell carcinoma') {
      suggestion = "Segera konsultasi dengan dokter terdekat untuk meminimalisasi penyebaran kanker.";
    } else if (label === 'Vascular lesion') {
      suggestion = "Segera konsultasi dengan dokter terdekat untuk mengetahui detail terkait tingkat bahaya penyakit.";
    }

    // Tentukan apakah hasil prediksi adalah kanker atau bukan
    return { confidenceScore, label, suggestion };
  } catch (error) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictClassification;
