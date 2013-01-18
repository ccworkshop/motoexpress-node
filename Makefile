all: restart

restart: rsync
	ssh -oStrictHostKeyChecking=no root@106.186.21.26 "stop motoexpress-node; start motoexpress-node" 2>/dev/null

rsync: 
	rsync -av /Users/Spooky/projects/motoexpress-node root@106.186.21.26:projects
