import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query;
      const users = database.select(
        "tasks",
        search
          ? {
              title: search,
            }
          : null
      );

      return res.end(JSON.stringify(users));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required.");
      }
      const task = {
        uuid: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert("tasks", task);
      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required.");
      }

      try {
        const task = database.select("tasks", { uuid: id })[0];
        task.title = title;
        task.description = description;
        task.updated_at = new Date();

        database.update("tasks", id, task);
      } catch (error) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ error: error.message }));
        return res.end();
      }
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params;
      try {
        database.update("tasks", id, {
          completed_at: new Date(),
          updated_at: new Date(),
        });
      } catch (error) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ error: error.message }));
        return res.end();
      }
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;
      try {
        database.delete("tasks", id);
      } catch (error) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ error: error.message }));
        return res.end();
      }
      return res.writeHead(204).end();
    },
  },
];
