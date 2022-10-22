USE company_db;

INSERT INTO department (name) VALUES
("FOH"),
("BOH"),
("Manager");

INSERT INTO role (title, salary, department_id) VALUES
("Cook", 60000, 2),
("Dishwasher", 30000, 2),
("Bartender", 80000, 1),
("Manager", 100000, 3),
("Server", 70000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
("Carl", "S", 4, 1),
("Bob", "B", 2, null),
("Beth", "B", 5, null),
("Dan", "J", 1, null),
("Sue", "L", 3, null),
("Jess", "P", 5, null);