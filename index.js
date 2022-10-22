var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "company_db",
});

connection.connect((err) => {
  if (err) {
    console.log(err);
    throw err;
  } else {
    start();
  }
});

//user input to select function to run
//This function is called to start the application, and prompts the user to choose an action.
function start() {
  //console.log("Start App");
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      name: "start",
      choices: [
        "Add Department",
        "Add Role",
        "Add Employee",
        "View Departments",
        "View Roles",
        "View Employees",
        "Update Employee Role",
        "Quit",
      ],
    })
    //take user selection, then call function via switch statement
    .then((res) => {
      switch (res.start) {
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "View Departments":
          viewDepartments();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        case "Quit":
          console.log("Goodbye!");
          connection.end();
          break;
      }
    });
}

//Function: add department
//Prompt user for name of the new department, and use SQL INSERT INTO to pass new department into database
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "What is department name?",
      name: "newDepartment",
    })
    .then((res) => {
      connection.query("INSERT INTO department SET ?", {
        name: res.newDepartment,
      });

      console.log("Department added");

      start();
    });
}

//Function: add role
//Prompt the user to provide input for role, salary, department
//Current department info retrieved from database with select statement, and passed into function
//Compare department response
function addRole() {
  connection.query(
    "SELECT * FROM department",
    function (err, responseDepartment) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is job title?",
            name: "newTitle",
          },
          {
            type: "input",
            message: "What is salary?",
            name: "newSalary",
          },
          {
            type: "list",
            message: "What is department?",
            name: "dept",
            choices: function () {
              var departmentArray = [];
              for (var i = 0; i < responseDepartment.length; i++) {
                departmentArray.push(responseDepartment[i].name);
              }
              return departmentArray;
            },
          },
        ])
        .then((res) => {
          var chosenDepartment;
          for (var i = 0; i < responseDepartment.length; i++) {
            if (responseDepartment[i].name === res.dept) {
              chosenDepartment = responseDepartment[i].id;
            }
          }
          connection.query("INSERT INTO role SET ?", {
            title: res.newTitle,
            salary: res.newSalary,
            department_id: chosenDepartment,
          });
          console.log("Role added");
          start();
        });
    }
  );
}

//Function: add employee
function addEmployee() {
  connection.query("SELECT * FROM employee", function (err, responseEmployee) {
    if (err) throw err;
    connection.query("SELECT * FROM role", function (err, responseRole) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is first name?",
            name: "firstname",
          },
          {
            type: "input",
            message: "What is last name?",
            name: "lastname",
          },
          {
            type: "list",
            message: "What is role?",
            name: "roleID",
            choices: function () {
              var roleArray = [];
              for (var i = 0; i < responseRole.length; i++) {
                roleArray.push(responseRole[i].title);
              }
              return roleArray;
            },
          },
          {
            type: "list",
            message: "Who is the manager?",
            name: "managerID",
            choices: function () {
              var managers = [];
              for (var i = 0; i < responseEmployee.length; i++) {
                if (responseEmployee[i].manager_id === null) {
                  managers.push(
                    `${responseEmployee[i].first_name} ${responseEmployee[i].last_name}`
                  );
                }
              }
              managers.push("None");
              return managers;
            },
          },
        ])

        .then((res) => {
          var chosenRole;
          for (var i = 0; i < responseRole.length; i++) {
            if (responseRole[i].title === res.roleID) {
              chosenRole = responseRole[i].id;
            }
          }
          var chosenManager;
          for (var i = 0; i < responseEmployee.length; i++) {
            if (
              `${responseEmployee[i].first_name} ${responseEmployee[i].last_name}` ===
              res.managerID
            ) {
              chosenManager = responseEmployee[i].id;
            } else if (res.managerID === "None") {
              chosenManager = null;
            }
          }
          connection.query("INSERT INTO employee SET ?", {
            first_name: res.firstname,
            last_name: res.lastname,
            role_id: chosenRole,
            manager_id: chosenManager,
          });
          console.log("Employee added");
          start();
        });
    });
  });
}

//Function: view department
function viewDepartments() {
  connection.query(`SELECT * FROM  department`, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

//Function: view role
function viewRoles() {
  connection.query(
    `SELECT role.id, title, name, salary FROM role INNER JOIN department ON role.department_id = department.id ORDER BY id ASC`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

//Function: view employee
function viewEmployees() {
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, CONCAT(manager.first_name,' ',manager.last_name) AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id LEFT JOIN employee manager ON employee.manager_id = manager.id ORDER BY employee.id ASC",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

//Function: update employee role
function updateRole() {
  connection.query("SELECT * FROM employee", function (err, responseEmployee) {
    if (err) throw err;
    connection.query("SELECT * FROM role", function (err, responseRole) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to update?",
            name: "chooseEmployee",
            choices: function () {
              var employeeArray = [];
              for (var i = 0; i < responseEmployee.length; i++) {
                employeeArray.push(
                  `${responseEmployee[i].first_name} ${responseEmployee[i].last_name}`
                );
              }
              return employeeArray;
            },
          },
          {
            type: "list",
            message: "New Role:",
            name: "updateRole",
            choices: function () {
              var roleArray = [];
              for (var i = 0; i < responseRole.length; i++) {
                roleArray.push(responseRole[i].title);
              }
              return roleArray;
            },
          },
        ])
        .then((res) => {
          let name = res.chooseEmployee.split(" ");
          let first = name[0];
          let last = name[1];

          var updateEmployeeRole;
          for (var i = 0; i < responseRole.length; i++) {
            if (responseRole[i].title === res.updateRole) {
              updateEmployeeRole = responseRole[i].id;
            }
          }
          connection.query(
            "UPDATE employee SET ? WHERE ? AND ?",
            [
              {
                role_id: updateEmployeeRole,
              },
              {
                first_name: first,
              },
              {
                last_name: last,
              },
            ],

            function (err, res) {
              if (err) throw err;
              console.log("Employee's role is updated.");
              start();
              return res;
            }
          );
        });
    });
  });
}
