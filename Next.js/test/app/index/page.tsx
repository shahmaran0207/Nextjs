"use client"

import { useState } from "react"

export default function Home() {
    const [todo, setTodo] = useState<string[]>([]);
    const [newTodo, setNewTodo] = useState("");

    const handleAddTodo = (event: any) => {
        event.preventDefault();
        if(newTodo.trim() === "") return;
        setTodo([...todo, newTodo.trim()]);
        setNewTodo("");
    };

    const handleUpdateTodo = (event: any, index: any) => {
        event.preventDefault();
        const updateTodo = event.target.value.trim();
        if(updateTodo === "") return;
        const newTodos = [...todo];
        newTodos[index] = updateTodo;
        setTodo(newTodos);
    };

    const handleDeleteTodo = (index: any) => {
        const newTodos = [...todo];
        newTodos.splice(index, 1);
        setTodo(newTodos);
    };

return (
    <div >
      <h1>My Todo List</h1>
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          placeholder="오늘 할 일 추가"
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
        />
        <button type="submit">
          Add
        </button>
      </form>
      <ul>
        {todo.map((todo, index) => (
          <li key={index} >
            <input
              type="checkbox"
              id={`todo-${index}`}
            />
            <label  htmlFor={`todo-${index}`}>
              <input
                type="text"
                value={todo}
                onChange={(event) => handleUpdateTodo(event, index)}
              />
              <span>{todo}</span>
            </label>
            <button
              onClick={() => handleDeleteTodo(index)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}