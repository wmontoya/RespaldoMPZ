<html>

<head>
  <title>MPZ</title>
</head>

<body>
  <?php
  $today = date("Y-m-d");
  $filePath = "logs_$today.log";
  function redirect($filePath)
  {
    $arrContextOptions = array(
      "ssl" => array(
        "verify_peer" => false,
        "verify_peer_name" => false,
      ),
    );
    file_put_contents($filePath, "----------Start" . PHP_EOL, FILE_APPEND);

    try {
      if ($_POST['x_invoice_num'] == '') {
        $data = json_decode(file_get_contents('php://input'), true);

        file_put_contents($filePath, "data:" . json_encode($data) . PHP_EOL, FILE_APPEND);
        $cadena = array();
        foreach ($data as $clave => $valor) {
          if ($clave == 'status') {
            foreach ($valor as $clav => $valo) {
              $cadena[] = $valo;
            }
          } else {
            $cadena[] = $valor;
          }
        }
        $serviceOnSPO = array('SPO', 'RUN');
        $serviceOnPayment = array('BOL', 'MIP');

        if (in_array(substr($cadena[5], 0, 3), $serviceOnSPO)) {

          if ($cadena[0] == 'APPROVED') {
            $url = "https://www.perezzeledon.go.cr:9980/SPO_API.asmx/PAY_BILL_PLACETOPAY?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=00&invoice=" . $cadena[5];
          } else {
            $url = "https://www.perezzeledon.go.cr:9980/SPO_API.asmx/PAY_BILL_PLACETOPAY?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=01&invoice=" . $cadena[5];
          }
          $decodedUrl = html_entity_decode($url);
          file_put_contents($filePath, "url:" . $decodedUrl . PHP_EOL, FILE_APPEND);

          $response = file_get_contents($decodedUrl, false, stream_context_create($arrContextOptions));
          file_put_contents($filePath, "response:" . $response . PHP_EOL, FILE_APPEND);
        }
        if (in_array(substr($cadena[5], 0, 3), $serviceOnPayment)) {

          if ($cadena[0] == 'APPROVED') {
            $url = "https://172.19.0.37:443/api/v1/compute_response/" . $cadena[6] . "/" . $cadena[4] . "/" . $cadena[3] . "/" . $cadena[0] . "/0000/00/" . $cadena[5];
          } else {
            $url = "https://172.19.0.37:443/api/v1/compute_response/" . $cadena[6] . "/" . $cadena[4] . "/" . $cadena[3] . "/" . $cadena[0] . "/0000/01/" . $cadena[5];
          }          
	  $decodedUrl = html_entity_decode($url);
          file_put_contents($filePath, "url:" . $decodedUrl . PHP_EOL, FILE_APPEND);

          $response = file_get_contents($decodedUrl, false, stream_context_create($arrContextOptions));
          file_put_contents($filePath, "response:" . $response . PHP_EOL, FILE_APPEND);
        }
        
        if (substr($cadena[5], 0, 3) == 'PPT') {
          if ($cadena[0] == 'APPROVED') {
            $url = "https://www.perezzeledon.go.cr:5500/fields_api.asmx/ConfirmarPagoPlaceToPay?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=00&invoice=" . $cadena[5];
          } else {
            $url = "https://www.perezzeledon.go.cr:5500/fields_api.asmx/ConfirmarPagoPlaceToPay?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=01&invoice=" . $cadena[5];
          }
          $decodedUrl = html_entity_decode($url);
          file_put_contents($filePath,  "url:" . $decodedUrl . PHP_EOL, FILE_APPEND);
          file_get_contents($decodedUrl);

          $response = file_get_contents($decodedUrl);
          file_put_contents($filePath, "response:" . $response . PHP_EOL, FILE_APPEND);
        }
        if (substr($cadena[5], 0, 3) == 'CCD') {
          if ($cadena[0] == 'APPROVED') {
            $url = "https://www.perezzeledon.go.cr:5500/fields_api.asmx/ConfirmarPagoPlaceToPay?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=00&invoice=" . $cadena[5];
          } else {
            $url = "https://www.perezzeledon.go.cr:5500/fields_api.asmx/ConfirmarPagoPlaceToPay?hash=" . $cadena[6] . "&trans=" . $cadena[4] . "&date=" . $cadena[3] . "&response=" . $cadena[0] . "&auth=0000&error=01&invoice=" . $cadena[5];
          }
          $decodedUrl = html_entity_decode($url);
          file_put_contents($filePath,  "url:" . $decodedUrl . PHP_EOL, FILE_APPEND);
          file_get_contents($decodedUrl);

          $response = file_get_contents($decodedUrl);
          file_put_contents($filePath, "response:" . $response . PHP_EOL, FILE_APPEND);
        }
      } else {
        echo - (strlen($_POST['x_invoice_num']) - 3);
        if (substr($_POST['x_invoice_num'], 0, 3) == 'CCD') {
          if ($_POST['x_response_code'] == 1) {
            header("Location:  https://www.perezzeledon.go.cr/apps/app_canchas/#/end/" . $_POST['x_MD5_hash'] . "/" . $_POST['x_trans_id'] . "/" . $_POST['x_date'] . "/" . $_POST['x_response_code'] . "/" . $_POST['x_auth_code'] . "/" . $_POST['x_iso_error_code'] . "/" . $_POST['x_invoice_num'], true, 301);
          } else {
            header("Location:  https://www.perezzeledon.go.cr/apps/app_canchas/#/end/" . $_POST['x_date'] . "/" . $_POST['x_response_code'] . "/" . $_POST['x_invoice_num'], true, 301);
          }
        }
        exit();
      }
    } catch (Exception $e) {
      file_put_contents($filePath, "----ERROR" . $e->getMessage() . PHP_EOL, FILE_APPEND);
    }
  }


  redirect($filePath);
  file_put_contents($filePath, "----------Finish" . PHP_EOL, FILE_APPEND);
  ?>
</body>

</html>