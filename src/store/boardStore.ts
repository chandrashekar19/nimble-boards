import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description?: string;
  listId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
}

interface BoardState {
  board: Board;
  addList: (title: string) => void;
  updateListTitle: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;
  addTask: (listId: string, title: string, description?: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newListId: string, newOrder: number) => void;
  reorderLists: (lists: List[]) => void;
}

// Initial board data
const initialBoard: Board = {
  id: 'main-board',
  title: 'My Task Board',
  lists: [
    {
      id: 'todo',
      title: 'To Do',
      order: 0,
      tasks: [
        {
          id: uuidv4(),
          title: 'Design system setup',
          description: 'Create a consistent design system for the project',
          listId: 'todo',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          title: 'User authentication',
          description: 'Implement login and registration functionality',
          listId: 'todo',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'doing',
      title: 'In Progress',
      order: 1,
      tasks: [
        {
          id: uuidv4(),
          title: 'Task board interface',
          description: 'Build the main task management interface',
          listId: 'doing',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      order: 2,
      tasks: [
        {
          id: uuidv4(),
          title: 'Project setup',
          description: 'Initialize the project with necessary dependencies',
          listId: 'done',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ],
};

export const useBoardStore = create<BoardState>((set, get) => ({
  board: initialBoard,

  addList: (title: string) => {
    const newList: List = {
      id: uuidv4(),
      title,
      order: get().board.lists.length,
      tasks: [],
    };

    set((state) => ({
      board: {
        ...state.board,
        lists: [...state.board.lists, newList],
      },
    }));
  },

  updateListTitle: (listId: string, title: string) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists.map((list) =>
          list.id === listId ? { ...list, title } : list
        ),
      },
    }));
  },

  deleteList: (listId: string) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists.filter((list) => list.id !== listId),
      },
    }));
  },

  addTask: (listId: string, title: string, description?: string) => {
    const list = get().board.lists.find((l) => l.id === listId);
    if (!list) return;

    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      listId,
      order: list.tasks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists.map((list) =>
          list.id === listId
            ? { ...list, tasks: [...list.tasks, newTask] }
            : list
        ),
      },
    }));
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        })),
      },
    }));
  },

  deleteTask: (taskId: string) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: state.board.lists.map((list) => ({
          ...list,
          tasks: list.tasks.filter((task) => task.id !== taskId),
        })),
      },
    }));
  },

  moveTask: (taskId: string, newListId: string, newOrder: number) => {
    const { board } = get();
    let taskToMove: Task | null = null;
    
    // Find and remove the task from its current list
    const updatedLists = board.lists.map((list) => {
      const taskIndex = list.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex >= 0) {
        taskToMove = { ...list.tasks[taskIndex], listId: newListId, order: newOrder };
        return {
          ...list,
          tasks: list.tasks.filter((task) => task.id !== taskId),
        };
      }
      return list;
    });

    if (!taskToMove) return;

    // Add the task to the new list and reorder
    const finalLists = updatedLists.map((list) => {
      if (list.id === newListId) {
        const newTasks = [...list.tasks];
        newTasks.splice(newOrder, 0, taskToMove!);
        return {
          ...list,
          tasks: newTasks.map((task, index) => ({ ...task, order: index })),
        };
      }
      return {
        ...list,
        tasks: list.tasks.map((task, index) => ({ ...task, order: index })),
      };
    });

    set({ board: { ...board, lists: finalLists } });
  },

  reorderLists: (lists: List[]) => {
    set((state) => ({
      board: {
        ...state.board,
        lists: lists.map((list, index) => ({ ...list, order: index })),
      },
    }));
  },
}));