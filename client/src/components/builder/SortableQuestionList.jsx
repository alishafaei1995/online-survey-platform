import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionEditor from './QuestionEditor';

function SortableItem({ question, index, earlierQuestions, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        question={question}
        index={index}
        earlierQuestions={earlierQuestions}
        onChange={onChange}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function SortableQuestionList({ questions, onReorder, onChangeQuestion, onRemoveQuestion }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q._id === active.id);
    const newIndex = questions.findIndex((q) => q._id === over.id);
    onReorder(arrayMove(questions, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q._id)} strategy={verticalListSortingStrategy}>
        {questions.map((q, index) => (
          <SortableItem
            key={q._id}
            question={q}
            index={index}
            earlierQuestions={questions.slice(0, index)}
            onChange={(updated) => onChangeQuestion(index, updated)}
            onRemove={() => onRemoveQuestion(index)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
