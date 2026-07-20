// test/user.test.ts
import { describe, it, expect } from 'vitest';
import { userOperations, userFields } from '../nodes/TeamRetro/descriptions/User';

const opValues = (userOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (userOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('User resource', () => {
  it('exposes the 5 user operations in alphabetical-by-display-name order', () => {
    expect(opValues).toEqual(['add', 'delete', 'get', 'getAll', 'update']);
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({
      method: 'GET',
      url: '/v1/users',
    });
    expect(routeOf('add')).toMatchObject({
      method: 'PUT',
      url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('delete')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
    });
  });

  it('Get Many includes pagination and rootPropertyData', () => {
    const op = (userOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(op.routing.operations).toBeDefined();
    expect(op.routing.operations.pagination).toBeDefined();
    expect(op.routing.output.postReceive).toBeDefined();
  });

  it('Delete includes deletedTrue post-receive transformation', () => {
    const op = (userOperations.options as any[]).find((o) => o.value === 'delete');
    expect(op.routing.output.postReceive).toBeDefined();
  });

  it('email field is required and shown for add/get/update/delete (not getAll)', () => {
    const emailField = userFields.find((f) => f.name === 'email');
    expect(emailField?.required).toBe(true);
    const displayOps = (emailField?.displayOptions?.show as any)?.operation || [];
    expect(displayOps).toEqual(['add', 'delete', 'get', 'update']);
  });

  it('Add operation has Additional Fields collection with name and organizationAdmin', () => {
    const additionalFields = userFields.find(
      (f) =>
        f.name === 'additionalFields' &&
        (f.displayOptions?.show as any)?.operation?.includes('add'),
    );
    expect(additionalFields).toBeDefined();
    expect(additionalFields?.type).toBe('collection');
    const options = (additionalFields as any).options || [];
    expect(options.some((opt: any) => opt.name === 'name')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'organizationAdmin')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'active')).toBe(true);
  });

  it('Update operation has Update Fields collection with name, organizationAdmin, and active', () => {
    const updateFields = userFields.find(
      (f) =>
        f.name === 'updateFields' &&
        (f.displayOptions?.show as any)?.operation?.includes('update'),
    );
    expect(updateFields).toBeDefined();
    expect(updateFields?.type).toBe('collection');
    const options = (updateFields as any).options || [];
    expect(options.some((opt: any) => opt.name === 'name')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'organizationAdmin')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'active')).toBe(true);
  });

  it('default operation is getAll', () => {
    expect(userOperations.default).toBe('getAll');
  });

  it('email field description mentions account-scoped key requirement', () => {
    const emailField = userFields.find((f) => f.name === 'email');
    expect((emailField?.description || '').toLowerCase()).toContain('account-scoped');
  });
});
