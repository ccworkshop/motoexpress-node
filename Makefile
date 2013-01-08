all: rsync

rsync: 
	rsync -av /Users/Spooky/projects/motoexpress-node root@106.186.21.26:projects
