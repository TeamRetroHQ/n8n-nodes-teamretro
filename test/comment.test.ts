// test/comment.test.ts
import { describe, it, expect } from 'vitest';
import { commentOperations, commentFields } from '../nodes/TeamRetro/descriptions/Comment';

const opValues = (commentOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (commentOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Comment resource', () => {
  it('exposes the 3 comment operations in order', () => {
    expect(opValues).toEqual(['create', 'update', 'delete']);
  });
  it('routes each operation to the right method + path', () => {
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '=/v1/comments/{{$parameter.targetType}}/{{$parameter.targetId}}' });
    expect(routeOf('update')).toMatchObject({ method: 'PATCH', url: '=/v1/comments/{{$parameter.commentId}}' });
    expect(routeOf('delete')).toMatchObject({ method: 'DELETE', url: '=/v1/comments/{{$parameter.commentId}}' });
  });
  it('Create requires targetType (options) and targetId (string)', () => {
    const targetType = commentFields.find(
      (f) => f.name === 'targetType' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(targetType?.required).toBe(true);
    expect(targetType?.type).toBe('options');

    const targetId = commentFields.find(
      (f) => f.name === 'targetId' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(targetId?.required).toBe(true);
    expect(targetId?.type).toBe('string');
  });
  it('Create requires text field routed to body', () => {
    const text = commentFields.find(
      (f) => f.name === 'text' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(text?.required).toBe(true);
    expect((text as any)?.routing?.send).toMatchObject({ type: 'body', property: 'text' });
  });
  it('Update and Delete require commentId', () => {
    const commentId = commentFields.find(
      (f) => f.name === 'commentId' && (f.displayOptions?.show as any)?.operation?.includes('update')
    );
    expect(commentId?.required).toBe(true);
    expect(commentId?.type).toBe('string');

    const commentIdDel = commentFields.find(
      (f) => f.name === 'commentId' && (f.displayOptions?.show as any)?.operation?.includes('delete')
    );
    expect(commentIdDel?.required).toBe(true);
  });
  it('Update requires text field routed to body', () => {
    const text = commentFields.find(
      (f) => f.name === 'text' && (f.displayOptions?.show as any)?.operation?.includes('update')
    );
    expect(text?.required).toBe(true);
    expect((text as any)?.routing?.send).toMatchObject({ type: 'body', property: 'text' });
  });
  it('Delete operation has postReceive set to deletedTrue', () => {
    const deleteOp = (commentOperations.options as any[]).find((o) => o.value === 'delete');
    expect(deleteOp?.routing?.output?.postReceive).toBeDefined();
    expect(deleteOp.routing.output.postReceive.length).toBeGreaterThan(0);
    expect(deleteOp.routing.output.postReceive[0].type).toBe('set');
  });
});
