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
  update      update password of a new Timeplus user
```
## timeplus user list
:::warning Known issue for [Timeplus Enterprise 2.4.15](enterprise-releases#known_issue_2_4_15)
You need to add `--verbose` to this command to get the user list.
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

## timeplus user update --user [user] --password [password]
Update the password for the specified user.

## timeplus user create --user [user] --password [password]
Create a new user with the specified password.

## timeplus user delete --user [user]
Delete the specified user.
