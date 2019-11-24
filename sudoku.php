<?php

header("Content-type: application/json");
echo file_get_contents("https://sudoku.com/api/getLevel/hard");