const crypto = require('crypto');
const predictClassification = require('../services/inferenceService');
const InputError = require('../exceptions/InputError');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  // Validasi ukuran gambar
  const maxSize = 1000000; // 1MB
  if (image.bytes > maxSize) {
    const errorResponse = h.response({
      status: 'fail',
      message: `Payload content length greater than maximum allowed: ${maxSize}`
    });
    errorResponse.code(413); // Status Code: 413 Payload Too Large
    return errorResponse;
  }

  try {
    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Menentukan hasil prediksi (Cancer atau Non-cancer)
    const result = confidenceScore > 50 ? 'Cancer' : 'Non-cancer';
    const response = h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data: {
        id,
        result,
        suggestion: result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
        createdAt
      }
    });

    await storeData(id, data);


    response.code(201); // Status Code: 201 OK
    return response;

  } catch (error) {
    // Menangani kesalahan prediksi
    const errorResponse = h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    });
    errorResponse.code(400); // Status Code: 400 Bad Request
    return errorResponse;
  }
}

module.exports = postPredictHandler;
