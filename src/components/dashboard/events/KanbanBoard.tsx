import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd';

const KanbanBoard: React.FC = () => {
  const columns = {
    todo: {
      name: 'To-Do',
      items: []
    },
    inProgress: {
      name: 'In Progress',
      items: []
    },
    done: {
      name: 'Done',
      items: [{ id: '1', content: 'Sample Task 1' }, { id: '2', content: 'Sample Task 2' }]
    }
  };

  const onDragEnd = (result: DropResult) => {
    // Logic to handle drag and drop
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {Object.entries(columns).map(([columnId, column], index) => (
        <Droppable droppableId={columnId} key={columnId}>
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ margin: '8px', border: '1px solid lightgrey', borderRadius: '4px' }}
            >
              <h2>{column.name}</h2>
              {column.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: '16px',
                        margin: '0 0 8px 0',
                        minHeight: '50px',
                        backgroundColor: '#fff',
                        color: 'black',
                        ...provided.draggableProps.style
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default KanbanBoard;