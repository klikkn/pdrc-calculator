import { CanActivate } from '@nestjs/common';
import { Role, Roles } from '@pdrc/api-interfaces';
import { RolesGuard } from './auth.guard';

describe('RBAC Guard', () => {
  test.each([
    [[Roles.Admin], Roles.Admin, true],
    [[Roles.Admin], Roles.User, false],
    [[Roles.User], Roles.Admin, false],
    [[Roles.User], Roles.User, true],
    [[Roles.Admin, Roles.User], Roles.Admin, true],
    [[Roles.Admin, Roles.User], Roles.User, true],
  ])(
    'Guard check roles: %s, user is %s, should be %s',
    (roles: Role[], role: Role, result) => {
      const mockExecutionContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role } }),
        }),
      };
      const target: CanActivate = new RolesGuard(roles);
      expect(target.canActivate(mockExecutionContext)).toBe(result);
    }
  );
});
