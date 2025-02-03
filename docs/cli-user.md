# timeplus user

## timeplus user
When you run `timeplus user` without extra parameters, it will list all available sub-commmands, e.g.
```
Manage Timeplus Enterprise users

Usage:
  timeplus user [flags]
  timeplus user [command]

Available Commands:
  create      create a new Timeplus user
  delete      delete a new Timeplus user
  list        list Timeplus users
  update      update password or role for a Timeplus user
```
## timeplus user list
:::warning Known issue for [Timeplus Enterprise 2.4.15](/enterprise-v2.4#known_issue_2_4_15)
You need to add `--verbose` to this command to get the user list.

This is fixed in [Timeplus Enterprise 2.4.16](/enterprise-v2.4#2_4_16)
:::
This will list all users in the cluster.

Sample output:
```
admin
default
new_user
proton
```
For each new deployment, by default the `default` and `proton` users will be provisioned and you can create more users via the web console or CLI.

## timeplus user update --user [user] --password [password] {#change_pwd}
Update the password for the specified user.

## timeplus user update --user [user] --role [role] {#change_role}
Change the role for the specified user. The valid value of `role` can be either `admin` or `read_only`.

## timeplus user create --user [user] --password [password] {#create}
Create a new user with the specified password. By default, the `admin` role will be assigned. To create a user with read-only permission, add `--role read_only` to the end.

## timeplus user delete --user [user] {#delete}
Delete the specified user.
