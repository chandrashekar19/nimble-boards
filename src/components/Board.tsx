import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { TaskList } from './TaskList';
import { TaskCard } from './TaskCard';
import { useBoardStore, Task } from '@/store/boardStore';

export function Board() {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { board, addList, moveTask, reorderLists } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const listIds = board.lists.map((list) => list.id);

  const handleAddList = () => {
    if (newListTitle.trim()) {
      addList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Find the task being dragged
    const task = board.lists
      .flatMap(list => list.tasks)
      .find(task => task.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    // Check if we're dropping over a list
    const overList = board.lists.find(list => list.id === overId);
    if (overList) {
      // Move task to the end of the target list
      moveTask(activeId as string, overId as string, overList.tasks.length);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Handle list reordering
    if (board.lists.some(list => list.id === activeId) && 
        board.lists.some(list => list.id === overId)) {
      const oldIndex = board.lists.findIndex(list => list.id === activeId);
      const newIndex = board.lists.findIndex(list => list.id === overId);
      
      if (oldIndex !== newIndex) {
        const newLists = arrayMove(board.lists, oldIndex, newIndex);
        reorderLists(newLists);
      }
    }
    
    // Handle task reordering within the same list
    if (activeId !== overId) {
      // Find which lists contain these items
      const activeList = board.lists.find(list => 
        list.tasks.some(task => task.id === activeId)
      );
      const overList = board.lists.find(list => 
        list.tasks.some(task => task.id === overId)
      );
      
      if (activeList && overList && activeList.id === overList.id) {
        // Reordering within the same list
        const taskIndex = overList.tasks.findIndex(task => task.id === overId);
        moveTask(activeId as string, overList.id, taskIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-board-bg">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{board.title}</h1>
          <p className="text-muted-foreground">Organize your tasks and boost productivity</p>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {board.lists.map((list) => (
                <TaskList key={list.id} list={list} />
              ))}
            </SortableContext>

            {/* Add New List */}
            <div className="w-80 flex-shrink-0">
              {isAddingList ? (
                <div className="bg-list-bg border border-list-border rounded-lg p-4 space-y-3">
                  <Input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') {
                        setIsAddingList(false);
                        setNewListTitle('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddList} disabled={!newListTitle.trim()}>
                      Add List
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsAddingList(false);
                        setNewListTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingList(true)}
                  className="w-full h-16 border-dashed border-2 border-list-border hover:border-primary hover:bg-hover-bg transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add a list
                </Button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}