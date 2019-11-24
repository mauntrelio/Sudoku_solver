<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sudoku solver</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="img/sudoku.png">
</head>
<body>

  <h1>Sudoku solver</h1>
  
  <table id="sudoku">
    <?php for ($i = 1; $i < 10; $i++): ?>
    <tr>
      <?php for ($j = 1; $j < 10; $j++): ?>
        <?php 
        $class = "";
        if ($i == 3 || $i == 6) {
          $class = "bb $class";
        }
        if ($j == 3 || $j == 6) {
          $class = "br $class";
        }
        ?>
        <td class="<?=$class?>"><div class="empty content" id="cell_<?=$i?>_<?=$j?>" data-row="<?=$i?>" data-col="<?=$j?>" contenteditable="true"></div></td>
      <?php endfor; ?> 
    </tr>
    <?php endfor; ?> 
  </table>
  
  <div id="bottom">
    
    <div id="status"></div>

    <div id="settings">
      Speed: <input type="range" id="set_speed" min="10" step="5" value="50"> <span id="speed">50%</span>      
    </div>

    <div id="buttons">
      <button id="solve" type="button">Solve!</button>
      <button id="reset" type="button">Reset</button>
    </div>

  </div>

  <audio hidden id="beep" src="snd/beep.mp3" type="audio/mp3"></audio>
  <audio hidden id="win" src="snd/win.mp3" type="audio/mp3"></audio>
  <audio hidden id="fail" src="snd/fail.mp3" type="audio/mp3"></audio>

  <script src="js/jquery-3.4.1.min.js"></script>
  <script src="js/lodash.min.js"></script>
  <script src="js/jquery.fittext.js"></script>
  <script src="js/script.js"></script>


</body>
</html>