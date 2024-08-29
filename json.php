<?php
header('Content-Type: application/json');

// Archivo JSON donde se guardarán los datos
$filename = 'student.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['data'])) {
    $jsonData = $_POST['data'];

    // Decodificar JSON para asegurarse de que sea válido
    $data = json_decode($jsonData, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        // Convertir datos a UTF-8 si no están en esa codificación
        $jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // Escribir los datos en el archivo JSON
        file_put_contents($filename, $jsonString);
        echo json_encode(['status' => 'success', 'message' => 'Datos guardados con éxito']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error en los datos JSON']);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No se recibieron datos']);
}
?>
