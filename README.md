# convert LS_COLORS to toml

LS_COLORS is a shell environment variable that specifies the colors for different file types when you use ls. It is used by the GNU coreutils ls program and is also used by the GNU file program.

This program converts the LS_COLORS environment variable to a toml file. The toml file can be used by the [yazi](https://github.com/sxyazi/yazi) program to colorize the output of the ls command.

## Usage

```sh
npm run start|tail -n +4|pbcopy
```

Paste the result into your [theme.toml](https://yazi-rs.github.io/docs/configuration/overview) file
