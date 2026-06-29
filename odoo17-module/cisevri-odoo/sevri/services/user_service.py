class UserService:

    @staticmethod
    def parse_users(users):
        return [UserService._parse_single_user(user) for user in users]

    @staticmethod
    def _parse_single_user(user):
        return {
            "id": user.id,
            "name": user.name,
            "deparment": UserService._parse_departments(user.department_id),
            "city": user.city,
            "email": user.email,
        }

    @staticmethod
    def _parse_departments(departments):
        return [department.name for department in departments]
