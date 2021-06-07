import { fetchRequest } from "../lib/fetchRequest.js";
import { API_URL } from "../constants/config.js";

import UserList from "./UserList.js";
import TodoList from "./TodoList.js";
import TodoInput from "./TodoInput.js";
import TodoItemModel from "../model/TodoItemModel.js";
import UserModel from "../model/UserModel.js";

class TodoApp {
  constructor() {
    this.userList = new UserList({
      onAddUser: this.onAddUser.bind(this),
      onDeleteUser: this.onDeleteUser.bind(this),
      onSelectUser: this.onSelectUser.bind(this),
    });
    this.users = [];
    this.selectedUser = {};
    this.todoList = new TodoList({
      onDeleteItem: this.onDeleteItem,
      onCompleteItem: this.onCompleteItem,
      onEditingItem: this.onEditingItem,
      onEditItem: this.onEditItem,
    });
    this.todoInput = new TodoInput({ onAddItem: this.onAddItem.bind(this) });
    this.init();
  }

  init() {
    this.getUserList();
  }

  // UserList 함수

  async getUserList() {
    const { result, error } = await fetchRequest(API_URL.USERS, "get");

    if (error) return alert("사용자 목록 조회에 실패했습니다.");

    const userListData = result.map((user) => {
      const userTodoList = user.todoList.map((todoList) => {
        return new TodoItemModel({
          id: todoList._id,
          contents: todoList.contents,
          isCompleted: todoList.isCompleted,
        });
      });
      return new UserModel({ id: user._id, name: user.name, todoList: userTodoList });
    });

    this.users = userListData;
    this.selectedUser = userListData[0];
    this.userList.render(this.users);
    this.todoList.setState(this.selectedUser.todoList);
  }

  onSelectUser(id) {
    if (!id) return;

    this.selectedUser = this.users.find((user) => {
      return user.id == id;
    });

    this.todoList.setState(this.selectedUser.todoList);
  }

  async onAddUser() {
    const userName = prompt("추가하고 싶은 이름을 입력해주세요.");

    const { error } = await fetchRequest(API_URL.USERS, "post", { name: userName });
    if (error) return alert("사용자 추가에 실패했습니다.");
    this.getUserList();
  }

  async onDeleteUser() {
    const deleteId = this.selectedUser.id;
    const { error } = await fetchRequest(API_URL.USER(deleteId), "delete");
    if (error) return alert("사용자 삭제에 실패했습니다.");
    this.selectedUser = {};
    this.getUserList();
  }

  // TodoInput 함수

  async getUserTodoList(userId) {
    const { result, error } = await fetchRequest(API_URL.ITEM(userId), "get");
    if (error) alert("사용자의 리스트를 불러오는데 실패했습니다.");

    this.selectedUser.todoList = result.map((todoList) => {
      return new TodoItemModel({
        id: todoList._id,
        contents: todoList.contents,
        isCompleted: todoList.isCompleted,
      });
    });

    this.todoList.setState(this.selectedUser.todoList);
  }

  async onAddItem(contents) {
    const { error } = await fetchRequest(API_URL.ITEM(this.selectedUser.id), "post", {
      contents,
    });

    if (error) alert("할 일 추가에 실패했습니다.");

    this.getUserTodoList(this.selectedUser.id);
  }
}

export default TodoApp;
