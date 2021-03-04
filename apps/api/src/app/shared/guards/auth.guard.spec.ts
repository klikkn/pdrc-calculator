import { CanActivate } from '@nestjs/common';
import { Role } from '@pdrc/api-interfaces';
import { RolesGuard } from './auth.guard';

describe('RBAC Guard', () => {
  test.each([
    [[Role.Admin], Role.Admin, true],
    [[Role.Admin], Role.User, false],
    [[Role.User], Role.Admin, false],
    [[Role.User], Role.User, true],
    [[Role.Admin, Role.User], Role.Admin, true],
    [[Role.Admin, Role.User], Role.User, true],
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
