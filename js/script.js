
var Sudoku = (function($, _, document, window, undefined){

  "use strict";

  var full_set = [1,2,3,4,5,6,7,8,9];
  var current_timer = null;
  var pause_interval = 20;

  var iterations = 1;
  var added_last_iteration = false;
  var iteration_step = 0;
  var multiple_solutions = false;

  var candidates = [
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[]]
  ];

  var display_status = function(message, klass) {
    klass = klass || "";
    $("#status").html(message).attr("class", klass);
  };

  // get filled values of a column  
  var get_column = function(j) {
    var col = $("#sudoku").find("[data-col=" + j + "]").map(function(){
      return parseInt($(this).html());
    }).get();
    return _.compact(col);
  };

  // get filled values of a row  
  var get_row = function(i) {
    var row = $("#sudoku").find("[data-row=" + i + "]").map(function(){
      return parseInt($(this).html());
    }).get();
    return _.compact(row);
  };

  // get coordinates of cells in the same square of a given cell  
  var get_square_coords = function(i, j) {
    var first_row = Math.ceil(i/3)*3-2;
    var first_col = Math.ceil(j/3)*3-2;
    var index_col, index_row;
    var coords = [];
    for (var h = 0; h <= 2; h++) {
      for (var k = 0; k <= 2; k++) {
        index_row = first_row + h;
        index_col = first_col + k;
        coords.push([index_row,index_col]);
      }
    }
    return coords;
  };

  // get filled values of cells in the same square of a given cell  
  var get_square = function(i, j) {
    var coords = get_square_coords(i, j);
    var results = [];
    coords.forEach(function(element, index){
      results.push(parseInt($("#cell_" + element[0] + "_" + element[1]).html()));
    });
    return _.compact(results);
  };

  // check if a cell is empty
  var is_empty = function(i, j) {
    return $("#cell_" + i + "_" + j).hasClass("empty");
  };

  // check if the puzzle is solved
  var is_solved = function() {
    return $("#sudoku div.empty").length == 0;
  };

  // validate the value in cell i, j
  var validate_cell = function(i, j) {
    var is_valid = true;
    var $cell = $("#cell_" + i + "_" + j);

    // an empty cell is valid
    if (is_empty(i, j)) {
      return true;
    }
    
    // temporary remove cell content
    var value = parseInt($cell.html());
    $cell.html("");

    var row = get_row(i);
    var column = get_column(j);
    var square = get_square(i,j);

    // check if value is already present in same row, column, square
    if (row.indexOf(value) > -1 ||
        column.indexOf(value) > -1 || 
        square.indexOf(value) > -1) {
      is_valid = false;
      $cell.addClass("error");
    } else {
      $cell.removeClass("error");
    }
    // put back the value
    $cell.html(value);

    return is_valid;
  };

  // constrain a value manually filled in a cell to be valid
  var validate_input = function($cell) {
    var row = $cell.data("row");
    var col = $cell.data("col");
    // take only the last char of content
    var content = $cell.text().slice(0,1)
    $cell.text(content);
    // first check the raw content is admitted
    if (!content.match(/^[1-9]$/g)) {
      $cell.html("");
      $cell.removeClass("error").addClass("empty");
      return;      
    // then check if it is a valid value
    }
    // remove empty class if there is a content
    $cell.removeClass("empty");
    // validate the cell
    validate_cell(row, col);  
  };

  // display candidates in an empty cell
  var display_candidates = function(i, j) {
    var $cell = $("#cell_" + i + "_" + j);
    if (is_empty(i,j)) {
      var cell_candidates = candidates[i-1][j-1];
      var html_candidates = "<div class=\"notes\">";
      for (var h = 1; h <= 3; h++) {
        for (var k = 1; k <= 3; k++) {
          var value = (h-1)*3 + k;
          html_candidates += "<div>";
          if (cell_candidates.indexOf(value) > -1) {
            html_candidates += value;
          } else {
            html_candidates += "&nbsp;";            
          }
          html_candidates += "</div>";
        } 
      }
      html_candidates += "</div>";
      $cell.html(html_candidates);
    }
  };

  // display candidates in all empty cells
  var display_candidates_loop = function() {
    for (var i = 1; i <= 9; i++) {
      for (var j = 1; j <= 9; j++) {
        display_candidates(i,j);
      }
    }
  };

  // play a sound
  var play_sound = function(sound) {
    $("#"+sound)[0].play();
  };

  // fill in an empty cell
  var fill_in = function(i, j, value) {
    var $cell = $("#cell_" + i + "_" + j);
    // fill in value and adjust classes
    $cell.html(value).addClass("solved").removeClass("empty");
    
    // empty candidates of current cell
    candidates[i-1][j-1] = [];

    // remove solution from candidates of corresponding column
    for (var h = 0; h < 9; h++) {
      candidates[h][j-1] = _.difference(candidates[h][j-1], [value]);
    }  
    // remove solution from candidates of corresponding row
    for (var h = 0; h < 9; h++) {
      candidates[i-1][h] = _.difference(candidates[i-1][h], [value]);
    }  
    // remove solution from candidates of corresponding square
    var coords = get_square_coords(i, j);
    coords.forEach(function(element, index){
      var row = element[0];
      var col = element[1];
      candidates[row-1][col-1] = _.difference(candidates[row-1][col-1], [value]);
    });
    // update visualization of candidates of all cells
    display_candidates_loop();
    // play a beep (disabled: it is annoying, find another sound)
    // play_sound("beep");
  };

  // compute and display candidates of a cell
  var init_canditates = function(i, j) {
    if (is_empty(i,j)) {
      var row = get_row(i);
      var column = get_column(j);
      var square = get_square(i, j);
      candidates[i-1][j-1] = _.difference(full_set, row, column, square);
      // display found canditates
      display_candidates(i, j);
    } else {
      candidates[i-1][j-1] = [];
    }
  };

  // compute and display candidates of all cells
  var init_all_candidates = function() {
    for (var i = 1; i <= 9; i++) {
      for (var j = 1; j <= 9; j++) {
        init_canditates(i,j);
      }
    }
  };

  // solve a single cell by looking if only one solution is admitted (unique candidate)
  var solve_cell = function(i, j) {

    $("#cell_" + i + "_" + j).addClass("highlight");

    // find candidates at first loop
    if (candidates[i-1][j-1].length == 0) {
      init_canditates(i, j);
    }

    // candidates for cell are empty: puzzle is impossible
    if (candidates[i-1][j-1].length == 0) {
      $("#cell_" + i + "_" + j).removeClass("highlight").addClass("impossible");
      return "impossible";
    // unique candidate: is the solution        
    } else if (candidates[i-1][j-1].length == 1) {
      console.info("Found unique solution at cell %s,%s: %s", i, j, candidates[i-1][j-1][0]);
      fill_in(i, j, candidates[i-1][j-1][0]);
      return "solved";
    // multiple candidates: being worked out              
    } else {
      return "inprogress";
    }
  };

  // loop to solve cells by looking to those cells for which
  // only one solution is admitted (unique candidate)
  var solve_loop = function(i, j) {
    var do_next = true;
    var wait_interval = pause_interval;

    display_status("Looping cells for unique candidates");

    $("#sudoku div.content").removeClass("highlight");    

    if (is_empty(i, j)) {
      console.log("Evaluating cell %s,%s", i, j);
      var result = solve_cell(i, j);
      if (result == "impossible") {
        display_status("Puzzle is impossible: no candidates for cell " + i + ", " + j, "failure");
        play_sound("fail");
        return;
      } else if (result == "solved") {
        added_last_iteration = true;  
      }
    } else {
      wait_interval = 0;
    }

    if (is_solved()) {
      do_next = false;
    }
    
    // get indexes of next cell
    if (i == 9 && j == 9) {
      do_next = false;
    } else {
      if (j == 9) {
        j = 1;
        i++;
      } else {
        j++;
      }
    }

    if (do_next) {
      // do next cell
      current_timer = setTimeout(function(){solve_loop(i, j)}, wait_interval);
    } else {
      // do next step of iteration
      iteration_step = 1;
      current_timer = setTimeout(solve_iteration, wait_interval);
    }
  };

  // search a value which appears only once in a list of arrays
  var find_unique = function(list_of_candidates) {

    var found_value = false;
    var already_found = [];
    var value;
    var unique = [];

    for (var i = 0; i < list_of_candidates.length; i++) {
      for (var j = 0; j < list_of_candidates[i].length; j++) {
        found_value = false; 
        value = list_of_candidates[i][j];
        if (already_found.indexOf(value) == -1) {
          for (var k = i+1; k < list_of_candidates.length; k ++) {
            if (list_of_candidates[k].indexOf(value) > -1) {
              found_value = true;
              already_found.push(value);
            }
          }
          if (!found_value) {
            unique = [i, value];
          }
        }
      }
    }

    return unique;
  };

  // try to find a solution by searching among all candidates of cells 
  // of a given row a number which appears only once
  var solve_row_by_candidate = function(i) {
    // avoid to examine a row with no empty cells
    if ($("#sudoku").find("[data-row=" + i + "]").filter(".empty").length == 0) {
      return -1;
    }
    if (is_solved()) {
      return -1;
    }

    console.log("Examinining row %s", i);
    $("#sudoku").find("[data-row=" + i + "]").addClass("highlight");
    var my_row = candidates[i-1];
    var findings = find_unique(my_row);
    if (findings.length > 0) {
      console.info("Found unique candidate for row %s, at column %s, value: %s", i, findings[0]+1, findings[1]);
      fill_in(i, findings[0]+1, findings[1]);
      return 1;
    }
    return 0;
  };

  // try to find a solution by searching among all candidates of cells 
  // of a given column a number which appears only once
  var solve_column_by_candidate = function(j) {
    // avoid to examine a column with no empty cells
    if ($("#sudoku").find("[data-col=" + j + "]").filter(".empty").length == 0) {
      return -1;
    }
    if (is_solved()) {
      return -1;
    }

    console.log("Examinining column %s", j);
    $("#sudoku").find("[data-col=" + j + "]").addClass("highlight");
    var my_column = [];
    // get all candidates of i-th column
    for (var i = 0; i < 9; i++) {
      my_column.push(candidates[i][j-1]);
    }
    var findings = find_unique(my_column);
    if (findings.length > 0) {
      console.info("Found unique candidate for column %s, at row %s, value: %s", j, findings[0]+1, findings[1]);
      fill_in(findings[0]+1, j, findings[1]);
      return 1;
    }
    return 0;
  };

  // try to find a solution by searching among all candidates of cells 
  // of a given square a number which appears only once
  var solve_square_by_candidate = function(i,j) {
    var coords = get_square_coords(i,j);
    var any_empty = coords.some(function(coord){
      return is_empty(coord[0],coord[1]);
    });
    // avoid to examine a square with no empty cells
    if (!any_empty || is_solved()) {
      return -1;
    }
    console.log("Examinining square at %s, %s", i, j);
    var my_square = [];
    coords.forEach(function(coord){
      $("#cell_" + coord[0] + "_" + coord[1]).addClass("highlight");
      my_square.push(candidates[coord[0]-1][coord[1]-1]);
    });
    var findings = find_unique(my_square);
    if (findings.length > 0) {
      var cell = coords[findings[0]];
      console.info("Found unique candidate for square at %s, %s, value: %s", cell[0], cell[1], findings[1]);
      fill_in(cell[0], cell[1], findings[1]);
      return 1;
    }
    return 0;
  };

  // try to find a solution by searching among all candidates of cells 
  // of a given row, column, square a number which appears only once
  var solve_by_candidates = function(loop) {
    var solution_found = false;

    $("#sudoku div.content").removeClass("highlight");

    if (loop <= 9) {
      // examine canditates of rows
      display_status("Looping rows for unique candidates");
      solution_found = solve_row_by_candidate(loop);
    } else if (loop <= 18) {
      display_status("Looping columns for unique candidates");
      // we did not find unique candidates for any row:
      // examine canditates of columns
      solution_found = solve_column_by_candidate(loop - 9);
    } else if (loop <= 27) {
      display_status("Looping squares for unique candidates");
      // we did not yet find unique candidates for any column or row:
      // examine canditates of squares
      var index = loop - 18;
      var h = 3 * Math.ceil(index/3) - 2;
      var k = 7 - 9 * Math.sign(index % 3) + 3 * (index % 3);
      solution_found = solve_square_by_candidate(h,k);
    }
    
    // set we added at least iteration if a solution was found at any stage
    if (solution_found == 1) {
      added_last_iteration = true;
    }

    if (is_solved() || loop > 27) {
      // do next step of iteration
      iteration_step = 2;
      current_timer = setTimeout(solve_iteration, pause_interval*3);
    } else {
      console.log("Solve by canditates: next loop");
      loop ++;
      // jump immediately to next step when there is no reason to show a delay
      if (solution_found == -1) {
        solve_by_candidates(loop);
      } else {
        current_timer = setTimeout(function(){ solve_by_candidates(loop); }, pause_interval*3);
      }
    }

  }; 
  
  // repeat solve iterations until puzzle is solved or is impossible
  var solve_iteration = function() {
    
    $("#sudoku div.content").removeClass("highlight");
    
    var error_cells = $("#sudoku div.error").length;
    var impossible_cells = $("#sudoku div.impossible").length;

    if (is_solved()) {
      console.log("Puzzle solved in %s iterations", iterations);
      display_status("Puzzle solved in " + iterations + " iterations!", "success");
      play_sound("win");
      return;
    }
    
    if (error_cells > 0 || impossible_cells > 0) {
      console.log("Impossible or wrong cells found");
      display_status("Puzzle impossible!", "failure");
      play_sound("fail");
      return;
    }

    if (iteration_step == 0) {
      console.log("Start iteration %s with standard cells loop", iterations);
      added_last_iteration = false;
      solve_loop(1,1);
    } else if (iteration_step == 1) {
      console.log("Searching by candidates");
      solve_by_candidates(1);
    } else if (!added_last_iteration && iteration_step == 2) {
      console.log("No cells filled in the last iteration: puzzle admits more then one solution");
      display_status("Puzzle admits more than one solution!", "warning");
      play_sound("fail");
      return;
    } else {
      console.log("Added at least one digit at last iteration: re-iterating");
      iteration_step = 0;
      iterations ++;
      solve_iteration();
    }
        
  };

  // reset button
  var reset = function(){
    // stop processing
    clearTimeout(current_timer);
    // reset counters
    iteration_step = 0;
    iterations = 1;
    // reset candidates
    for (var i =0; i < 9; i++) {
      for (var j =0; j < 9; j++) {
        candidates[i][j] = [];
      }
    }
    // clean interface
    $("#sudoku div.content").removeClass("highlight");
    $("#sudoku div.empty").html("");
    $("#sudoku div.solved").html("").addClass("empty").removeClass("solved");
    $("#sudoku div.impossible").html("").removeClass("impossible");
    $("#sudoku div.error").html("").addClass("empty").removeClass("error");
    $("#sudoku div").attr("contenteditable","true");

    $("#solve").removeAttr("disabled");

    display_status("");
  };

  // build the grid
  var build_grid = function(){
    var html, klass;
    for (var i = 1; i < 10; i++) {
      html = "<tr>";
      for (var j = 1; j < 10; j++) {
        klass = "";
        if (i == 3 || i == 6) { 
          klass = "bb " + klass;
        }
        if (j == 3 || j == 6) {
          klass = "br " + klass;
        }
        html += "<td class=\"" + klass + "\">";
        html += "<div class=\"empty content\" id=\"cell_"+i+"_"+j+"\"";
        html += " data-row=\"" + i + "\" data-col=\""+j+"\" contenteditable=\"true\"></div></td>";
      }
      html += "</tr>";
      $(html).appendTo("#sudoku");
    }
  };

  // adjust speed on changing the range control
  var set_speed = function(speed) {
    $("#speed").html(speed + "%");
    if (speed == 100) {
      pause_interval = 0;
    } else {
      pause_interval = Math.exp((100 - speed)/20)*6;
    }
  };

  var init = function() {

    build_grid();

    $("#sudoku div.content").fitText(0.18);

    $("#set_speed").on("input",function(){
      set_speed($(this).val());
    });

    $("#sudoku div.content").on("input",function(e){
      validate_input($(this));
    });

    $("#solve").on("click", function(e) {
      $(this).attr("disabled", "disabled");
      $("#sudoku div.content").removeAttr("contenteditable");
      solve_iteration();
    });

    $("#reset").on("click", reset);

  };

  return {
      init: init
  };

}(jQuery, _, document, window));
  

$(function(){

  Sudoku.init();

});