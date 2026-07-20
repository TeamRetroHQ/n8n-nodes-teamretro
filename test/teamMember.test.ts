// test/teamMember.test.ts
import { describe, it, expect } from 'vitest';
import { teamMemberOperations, teamMemberFields } from '../nodes/TeamRetro/descriptions/TeamMember';

const opValues = (teamMemberOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (teamMemberOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Team Member resource', () => {
  it('exposes the 5 team member operations in alphabetical-by-display-name order', () => {
    expect(opValues).toEqual(['add', 'get', 'getAll', 'remove', 'update']);
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({
      method: 'GET',
      url: '=/v1/teams/{{$parameter.teamId}}/members',
    });
    expect(routeOf('add')).toMatchObject({
      method: 'PUT',
      url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('remove')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
    });
  });

  it('Get Many includes pagination and rootPropertyData', () => {
    const op = (teamMemberOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(op.routing.operations).toBeDefined();
    expect(op.routing.operations.pagination).toBeDefined();
    expect(op.routing.output.postReceive).toBeDefined();
  });

  it('Remove includes deletedTrue post-receive transformation', () => {
    const op = (teamMemberOperations.options as any[]).find((o) => o.value === 'remove');
    expect(op.routing.output.postReceive).toBeDefined();
  });

  it('teamId field is required for all operations', () => {
    const teamIdField = teamMemberFields.find((f) => f.name === 'teamId');
    expect(teamIdField?.required).toBe(true);
    // Check it's displayed for all operations
    const displayOps = (teamIdField?.displayOptions?.show as any)?.operation || [];
    expect(displayOps).toContain('add');
    expect(displayOps).toContain('get');
    expect(displayOps).toContain('getAll');
    expect(displayOps).toContain('remove');
    expect(displayOps).toContain('update');
  });

  it('email field is required and shown for add/get/update/remove (not getAll)', () => {
    const emailField = teamMemberFields.find((f) => f.name === 'email');
    expect(emailField?.required).toBe(true);
    const displayOps = (emailField?.displayOptions?.show as any)?.operation || [];
    expect(displayOps).toEqual(['add', 'get', 'remove', 'update']);
  });

  it('Add operation has Additional Fields collection with name and teamAdmin', () => {
    const additionalFields = teamMemberFields.find(
      (f) =>
        f.name === 'additionalFields' &&
        (f.displayOptions?.show as any)?.operation?.includes('add'),
    );
    expect(additionalFields).toBeDefined();
    expect(additionalFields?.type).toBe('collection');
    const options = (additionalFields as any).options || [];
    expect(options.some((opt: any) => opt.name === 'name')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'teamAdmin')).toBe(true);
  });

  it('Update operation has Update Fields collection with name and teamAdmin', () => {
    const updateFields = teamMemberFields.find(
      (f) =>
        f.name === 'updateFields' &&
        (f.displayOptions?.show as any)?.operation?.includes('update'),
    );
    expect(updateFields).toBeDefined();
    expect(updateFields?.type).toBe('collection');
    const options = (updateFields as any).options || [];
    expect(options.some((opt: any) => opt.name === 'name')).toBe(true);
    expect(options.some((opt: any) => opt.name === 'teamAdmin')).toBe(true);
  });

  it('default operation is getAll', () => {
    expect(teamMemberOperations.default).toBe('getAll');
  });
});
